from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .filters import EmployeeFilter
from .models import Employee
from .serializers import (
    EmployeeDetailSerializer,
    EmployeeListSerializer,
    EmployeeResetPasswordSerializer,
    EmployeeWriteSerializer,
)


class EmployeeViewSet(PermissionMixin, viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('user').all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    permission_module = 'employees'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EmployeeFilter
    search_fields = [
        'user__first_name',
        'user__last_name',
        'father_name',
        'user__username',
        'user__email',
        'user__phone',
    ]
    ordering_fields = ['join_date', 'salary', 'created_at', 'updated_at']
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        if self.action == 'retrieve':
            return EmployeeDetailSerializer
        return EmployeeWriteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        read_serializer = EmployeeDetailSerializer(serializer.instance, context={'request': request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        read_serializer = EmployeeDetailSerializer(serializer.instance, context={'request': request})
        return Response(read_serializer.data, status=status.HTTP_200_OK)

    def perform_destroy(self, instance):
        user = instance.user
        user.is_active = False
        user.save(update_fields=['is_active'])
        super().perform_destroy(instance)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        employee = self.get_object()
        employee.status = Employee.STATUS_ACTIVE
        employee.save(update_fields=['status', 'updated_at'])

        user = employee.user
        user.is_active = True
        user.save(update_fields=['is_active'])

        serializer = EmployeeDetailSerializer(employee, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        employee = self.get_object()
        employee.status = Employee.STATUS_INACTIVE
        employee.save(update_fields=['status', 'updated_at'])

        user = employee.user
        user.is_active = False
        user.save(update_fields=['is_active'])

        serializer = EmployeeDetailSerializer(employee, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        employee = self.get_object()
        serializer = EmployeeResetPasswordSerializer(
            data=request.data,
            context={'employee': employee},
        )
        serializer.is_valid(raise_exception=True)

        employee.user.set_password(serializer.validated_data['password'])
        employee.user.save(update_fields=['password'])
        return Response({'detail': 'Password reset successfully.'}, status=status.HTTP_200_OK)
