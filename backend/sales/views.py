from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Count, Max, Sum
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .filters import CustomerFilter, SaleFilter
from .models import Customer, Sale
from .serializers import (
    CustomerPurchaseHistorySerializer,
    CustomerSerializer,
    SaleSerializer,
)


MONEY_QUANTIZE = Decimal('0.01')


def quantize_money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_QUANTIZE, rounding=ROUND_HALF_UP)


def recalculate_customer_aggregates(customer: Customer) -> None:
    customer_sales = Sale.objects.filter(customer=customer)
    aggregates = customer_sales.aggregate(
        total_spent=Sum('total_amount'),
        last_purchase_date=Max('sale_date'),
    )

    customer.total_completed_sales = customer_sales.count()
    customer.total_spent = quantize_money(aggregates['total_spent'] or Decimal('0.00'))
    customer.last_purchase_date = aggregates['last_purchase_date']
    customer.save(update_fields=['total_completed_sales', 'total_spent', 'last_purchase_date', 'updated_at'])


class CustomerViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'sales'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CustomerFilter
    search_fields = ['full_name', 'phone', 'email']
    ordering_fields = ['full_name', 'total_spent', 'total_completed_sales', 'created_at', 'updated_at']
    pagination_class = StandardResultsSetPagination

    @action(detail=True, methods=['get'], url_path='purchase-history')
    def purchase_history(self, request, pk=None):
        customer = self.get_object()
        queryset = (
            Sale.objects.filter(customer=customer)
            .annotate(item_count=Count('items'))
            .order_by('-sale_date', '-created_at')
        )

        summary = {
            'customer_id': customer.id,
            'customer_name': customer.full_name,
            'total_completed_sales': customer.total_completed_sales,
            'total_spent': customer.total_spent,
            'last_purchase_date': customer.last_purchase_date,
        }

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CustomerPurchaseHistorySerializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['summary'] = summary
            return response

        serializer = CustomerPurchaseHistorySerializer(queryset, many=True)
        return Response({'results': serializer.data, 'summary': summary})


class SaleViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Sale.objects.select_related('customer').prefetch_related('items__book').order_by('-sale_date', '-created_at')
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'sales'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SaleFilter
    search_fields = ['id', 'customer__full_name', 'customer__phone', 'customer__email']
    ordering_fields = ['sale_date', 'subtotal_amount', 'discount_amount', 'total_amount', 'created_at']
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        sale = serializer.save()
        if sale.customer_id:
            recalculate_customer_aggregates(sale.customer)

    def perform_update(self, serializer):
        previous_customer_id = serializer.instance.customer_id
        sale = serializer.save()

        affected_customer_ids = {previous_customer_id, sale.customer_id}
        for customer_id in affected_customer_ids:
            if not customer_id:
                continue
            customer = Customer.objects.get(pk=customer_id)
            recalculate_customer_aggregates(customer)

    def perform_destroy(self, instance):
        customer_id = instance.customer_id
        super().perform_destroy(instance)

        if customer_id:
            customer = Customer.objects.get(pk=customer_id)
            recalculate_customer_aggregates(customer)
