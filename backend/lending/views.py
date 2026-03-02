from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from books.models import Book
from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .filters import LendingFilter
from .models import Lending
from .serializers import LendingReturnSerializer, LendingSerializer


class LendingViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Lending.objects.select_related('book', 'customer').order_by('-created_at')
    serializer_class = LendingSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'lending'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = LendingFilter
    search_fields = [
        'book__title',
        'book__isbn',
        'customer__first_name',
        'customer__last_name',
        'customer__phone',
        'customer__email',
    ]
    ordering_fields = [
        'start_date',
        'end_date',
        'rent_price',
        'fine_per_day',
        'late_days',
        'fine_amount',
        'created_at',
        'updated_at',
    ]
    pagination_class = StandardResultsSetPagination

    @transaction.atomic
    def perform_create(self, serializer):
        lending = serializer.save()
        if lending.status == Lending.STATUS_NOT_RETURNED:
            self._apply_book_stock_delta(lending.book, -1)

    @transaction.atomic
    def perform_update(self, serializer):
        previous_book = serializer.instance.book
        previous_status = serializer.instance.status

        lending = serializer.save()

        if previous_status == Lending.STATUS_NOT_RETURNED:
            self._apply_book_stock_delta(previous_book, 1)

        if lending.status == Lending.STATUS_NOT_RETURNED:
            self._apply_book_stock_delta(lending.book, -1)

    @transaction.atomic
    def perform_destroy(self, instance):
        if instance.status == Lending.STATUS_NOT_RETURNED:
            self._apply_book_stock_delta(instance.book, 1)
        super().perform_destroy(instance)

    @action(detail=True, methods=['post'], url_path='return')
    @transaction.atomic
    def mark_as_returned(self, request, pk=None):
        lending = self.get_object()

        if lending.status == Lending.STATUS_RETURNED:
            return Response({'detail': 'This lending is already returned.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = LendingReturnSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        lending.status = Lending.STATUS_RETURNED
        lending.returned_at = timezone.now()
        lending.payment_status = serializer.validated_data.get('payment_status', lending.payment_status)
        lending.payment_method = serializer.validated_data.get('payment_method', lending.payment_method)
        lending.recalculate_fine(reference_date=lending.returned_at.date())
        lending.save()

        self._apply_book_stock_delta(lending.book, 1)
        data = LendingSerializer(lending, context={'request': request}).data
        return Response(data, status=status.HTTP_200_OK)

    def _apply_book_stock_delta(self, book: Book, delta: int):
        next_available_quantity = book.available_quantity + delta
        if next_available_quantity < 0:
            raise ValidationError({'book': 'Selected book does not have enough available quantity.'})
        if next_available_quantity > book.quantity:
            next_available_quantity = book.quantity

        if next_available_quantity == book.available_quantity:
            return

        book.available_quantity = next_available_quantity
        book.save(update_fields=['available_quantity', 'updated_at'])
