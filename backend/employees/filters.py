from django_filters import rest_framework as filters

from .models import Employee


class EmployeeFilter(filters.FilterSet):
    role_name = filters.CharFilter(field_name='user__role_name', lookup_expr='iexact')
    status = filters.ChoiceFilter(field_name='status', choices=Employee.STATUS_CHOICES)
    membership_type = filters.ChoiceFilter(field_name='membership_type', choices=Employee.MEMBERSHIP_CHOICES)
    join_date_from = filters.DateFilter(field_name='join_date', lookup_expr='gte')
    join_date_to = filters.DateFilter(field_name='join_date', lookup_expr='lte')
    min_salary = filters.NumberFilter(field_name='salary', lookup_expr='gte')
    max_salary = filters.NumberFilter(field_name='salary', lookup_expr='lte')

    class Meta:
        model = Employee
        fields = [
            'role_name',
            'status',
            'membership_type',
            'join_date_from',
            'join_date_to',
            'min_salary',
            'max_salary',
        ]
