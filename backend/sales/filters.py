from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Customer, Sale


class SaleFilter(filters.FilterSet):
    customer = filters.NumberFilter(field_name='customer_id')
    date_from = filters.DateTimeFilter(field_name='sale_date', lookup_expr='gte')
    date_to = filters.DateTimeFilter(field_name='sale_date', lookup_expr='lte')
    min_total = filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    max_total = filters.NumberFilter(field_name='total_amount', lookup_expr='lte')

    class Meta:
        model = Sale
        fields = ['customer', 'date_from', 'date_to', 'min_total', 'max_total']


class CustomerFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_search')

    class Meta:
        model = Customer
        fields = ['search', 'is_active']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(full_name__icontains=value)
            | Q(phone__icontains=value)
            | Q(email__icontains=value)
        )
