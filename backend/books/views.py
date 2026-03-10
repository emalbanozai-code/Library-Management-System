from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from core.notification_events import notify_book_stock_transition
from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .filters import BookFilter
from .models import Book, BookCategory
from .serializers import BookCategorySerializer, BookSerializer


class BookCategoryViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = BookCategory.objects.all().order_by('name')
    serializer_class = BookCategorySerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'books'
    permission_action = 'auto'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    pagination_class = StandardResultsSetPagination


class BookViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Book.objects.select_related('category').all().order_by('-created_at')
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'books'
    permission_action = 'auto'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BookFilter
    search_fields = ['title', 'author', 'isbn', 'category__name', 'publisher']
    ordering_fields = [
        'title',
        'category__name',
        'price',
        'publish_date',
        'quantity',
        'created_at',
        'updated_at',
    ]
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        book = serializer.save()
        notify_book_stock_transition(book, actor=self.request.user)

    def perform_update(self, serializer):
        previous_quantity = serializer.instance.quantity
        book = serializer.save()
        notify_book_stock_transition(
            book,
            previous_quantity=previous_quantity,
            actor=self.request.user,
        )
