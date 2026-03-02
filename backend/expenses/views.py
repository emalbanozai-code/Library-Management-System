from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .filters import ExpenseFilter
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('paid_by', 'paid_by__user').all().order_by('-payment_date', '-created_at')
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    permission_module = 'expenses'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ExpenseFilter
    search_fields = [
        'title',
        'description',
        'paid_by__user__first_name',
        'paid_by__user__last_name',
        'paid_by__user__username',
        'paid_by__user__email',
    ]
    ordering_fields = ['title', 'amount', 'payment_date', 'category', 'created_at', 'updated_at']
    pagination_class = StandardResultsSetPagination

