from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Expense


class ExpenseFilter(filters.FilterSet):
    paid_by = filters.NumberFilter(field_name='paid_by_id')
    category = filters.CharFilter(field_name='category')
    payment_date_from = filters.DateFilter(field_name='payment_date', lookup_expr='gte')
    payment_date_to = filters.DateFilter(field_name='payment_date', lookup_expr='lte')
    min_amount = filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name='amount', lookup_expr='lte')
    search = filters.CharFilter(method='filter_search')

    class Meta:
        model = Expense
        fields = [
            'paid_by',
            'category',
            'payment_date_from',
            'payment_date_to',
            'min_amount',
            'max_amount',
            'search',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset

        return queryset.filter(
            Q(title__icontains=value)
            | Q(description__icontains=value)
            | Q(paid_by__user__first_name__icontains=value)
            | Q(paid_by__user__last_name__icontains=value)
            | Q(paid_by__user__username__icontains=value)
            | Q(paid_by__user__email__icontains=value)
        )

