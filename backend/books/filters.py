from django_filters import rest_framework as filters

from .models import Book


class BookFilter(filters.FilterSet):
    category = filters.CharFilter(field_name='category', lookup_expr='iexact')
    rentable = filters.BooleanFilter(field_name='rentable')
    publisher = filters.CharFilter(field_name='publisher', lookup_expr='icontains')
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    in_stock = filters.BooleanFilter(method='filter_in_stock')
    low_stock = filters.NumberFilter(method='filter_low_stock')

    class Meta:
        model = Book
        fields = ['category', 'rentable', 'publisher', 'min_price', 'max_price', 'in_stock', 'low_stock']

    def filter_in_stock(self, queryset, name, value):
        if value is True:
            return queryset.filter(available_quantity__gt=0)
        if value is False:
            return queryset.filter(available_quantity=0)
        return queryset

    def filter_low_stock(self, queryset, name, value):
        threshold = int(value) if value is not None else 5
        return queryset.filter(available_quantity__lte=threshold)

