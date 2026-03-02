from django.db.models import Q
from django.utils import timezone
from django_filters import rest_framework as filters

from .models import Lending


class LendingFilter(filters.FilterSet):
    book = filters.NumberFilter(field_name='book_id')
    customer = filters.NumberFilter(field_name='customer_id')
    status = filters.CharFilter(field_name='status')
    payment_status = filters.CharFilter(field_name='payment_status')
    payment_method = filters.CharFilter(field_name='payment_method')
    start_date_from = filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_to = filters.DateFilter(field_name='start_date', lookup_expr='lte')
    end_date_from = filters.DateFilter(field_name='end_date', lookup_expr='gte')
    end_date_to = filters.DateFilter(field_name='end_date', lookup_expr='lte')
    min_rent_price = filters.NumberFilter(field_name='rent_price', lookup_expr='gte')
    max_rent_price = filters.NumberFilter(field_name='rent_price', lookup_expr='lte')
    min_fine_amount = filters.NumberFilter(field_name='fine_amount', lookup_expr='gte')
    max_fine_amount = filters.NumberFilter(field_name='fine_amount', lookup_expr='lte')
    late_only = filters.BooleanFilter(method='filter_late_only')
    overdue_only = filters.BooleanFilter(method='filter_overdue_only')
    search = filters.CharFilter(method='filter_search')

    class Meta:
        model = Lending
        fields = [
            'book',
            'customer',
            'status',
            'payment_status',
            'payment_method',
            'start_date_from',
            'start_date_to',
            'end_date_from',
            'end_date_to',
            'min_rent_price',
            'max_rent_price',
            'min_fine_amount',
            'max_fine_amount',
            'late_only',
            'overdue_only',
            'search',
        ]

    def filter_late_only(self, queryset, name, value):
        if value is not True:
            return queryset
        today = timezone.localdate()
        return queryset.filter(Q(late_days__gt=0) | Q(status=Lending.STATUS_NOT_RETURNED, end_date__lt=today))

    def filter_overdue_only(self, queryset, name, value):
        if value is not True:
            return queryset
        return queryset.filter(status=Lending.STATUS_NOT_RETURNED, end_date__lt=timezone.localdate())

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(book__title__icontains=value)
            | Q(book__isbn__icontains=value)
            | Q(customer__first_name__icontains=value)
            | Q(customer__last_name__icontains=value)
            | Q(customer__phone__icontains=value)
            | Q(customer__email__icontains=value)
        )

