from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.notification_events import notify_customer_created
from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin
from sales.models import Customer as SalesCustomer

from .filters import CustomerFilter
from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'customers'
    permission_action = 'auto'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CustomerFilter
    search_fields = ['first_name', 'last_name', 'phone', 'email', 'address']
    ordering_fields = [
        'first_name',
        'last_name',
        'total_purchases',
        'discount_percent',
        'created_at',
        'updated_at',
    ]
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        customer = serializer.save()
        notify_customer_created(customer, actor=self.request.user)

    def _get_or_create_sales_customer(self, customer: Customer) -> SalesCustomer:
        if customer.email:
            existing = SalesCustomer.objects.filter(email__iexact=customer.email).order_by('-updated_at').first()
            if existing:
                return existing

        if customer.phone:
            existing = SalesCustomer.objects.filter(phone__iexact=customer.phone).order_by('-updated_at').first()
            if existing:
                return existing

        existing = SalesCustomer.objects.filter(full_name__iexact=customer.full_name).order_by('-updated_at').first()
        if existing:
            return existing

        return SalesCustomer.objects.create(
            full_name=customer.full_name,
            phone=customer.phone,
            email=customer.email,
            is_active=customer.is_active,
        )

    @action(detail=False, methods=['get'], url_path='for-sales', permission_module='sales')
    def for_sales(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            data = serializer.data
            for row, customer in zip(data, page):
                row['sales_customer_id'] = self._get_or_create_sales_customer(customer).id
            return self.get_paginated_response(data)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        for row, customer in zip(data, queryset):
            row['sales_customer_id'] = self._get_or_create_sales_customer(customer).id
        return Response(data)
