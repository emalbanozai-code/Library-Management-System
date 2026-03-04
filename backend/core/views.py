from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Sum
from django.db.models import Count
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from django.utils import timezone
from django.utils.dateparse import parse_date

from books.models import Book
from customers.models import Customer
from employees.models import Employee
from expenses.models import Expense
from lending.models import Lending
from sales.models import Sale

from accounts.models import User, UserPermission
from accounts.serializers import CreateUserSerializer

from .models import (
    Settings, Permission, Notification
)
from .pagination import StandardResultsSetPagination
from .serializers import (
    EmailSettingsSerializer, ShopSettingsSerializer, SystemSettingsSerializer,
    SettingsUserListSerializer, SettingsUserWriteSerializer,
    NotificationSerializer, NotificationCreateSerializer
)
from .permissions import (
    
    CanAccessSettings, PermissionMixin
)


class SettingsViewSet(PermissionMixin, viewsets.ViewSet):
    permission_classes = [IsAuthenticated, CanAccessSettings]
    
    @action(detail=False, methods=['get', 'put'], url_path='shop')
    def shop_settings(self, request):
        """
        GET or PUT /api/settings/shop/
        """
        keys = ['shop_name', 'phone_number', 'contact_email', 'address']

        if request.method == 'GET':
            settings = Settings.objects.filter(setting_key__in=keys)
            data = {key: "" for key in keys}
            for s in settings:
                data[s.setting_key] = s.get_typed_value()
            return Response(data)
        
        
        serializer = ShopSettingsSerializer(
            data=request.data,
            
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get', 'put'], url_path='email')
    def email_settings(self, request):
        """
        GET or PUT /api/settings/email/
        """
        keys = ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'from_email']

        if request.method == 'GET':
            settings = Settings.objects.filter(setting_key__in=keys)
            data = {key: "" for key in keys}
            for s in settings:
                data[s.setting_key] = s.get_typed_value()
            # Never return smtp_password if you want security
            data['smtp_password'] = None
            return Response(data)

        serializer = EmailSettingsSerializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get', 'put'], url_path='logo', parser_classes=[MultiPartParser])
    def logo_settings(self, request):
        """
        GET /api/settings/logo/     → Get current logo URL
        PUT /api/settings/logo/     → Upload or update logo image
        """
        key = 'shop_logo'
        shop_key = "shop_name"
        if request.method == 'GET':
            try:
                setting = Settings.objects.get(setting_key=key, setting_type='image')
                shop_name = Settings.objects.get(setting_key=shop_key)
                logo_url = request.build_absolute_uri(setting.get_typed_value())
                return Response({'logo': logo_url, 'shop_name': shop_name.get_typed_value()}, status=200)
            except Settings.DoesNotExist:
                return Response({'logo': None, 'shop_name': ''}, status=200)

        # PUT logic: handle single file upload
        files = request.FILES.getlist('logo')
        if len(files) != 1:
            return Response(
                {'error': 'Please upload exactly one logo file.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file = files[0]
        if not file.content_type or not file.content_type.startswith('image/'):
            return Response(
                {'error': 'Invalid file type. Please upload an image.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if file.size > 2 * 1024 * 1024:
            return Response(
                {'error': 'File size must be less than 2MB.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        setting, created = Settings.objects.get_or_create(
            setting_key=key,
            defaults={
                'setting_type': 'image',
                'category': 'branding',
                'description': 'Library logo',
            }
        )

        if setting.setting_image:
            setting.setting_image.delete(save=False)
        setting.setting_image = file
        setting.save()
        logo_url = request.build_absolute_uri(setting.get_typed_value())

        return Response({'logo': logo_url}, status=200)

    @action(detail=False, methods=['get', 'put'], url_path='system')
    def system_settings(self, request):
        """
        GET or PUT /api/settings/system/
        """
        if request.method == 'GET':
            return Response(_get_system_settings_data())

        serializer = SystemSettingsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(_get_system_settings_data(), status=status.HTTP_200_OK)


class SettingsUsersViewSet(PermissionMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    permission_module = 'settings'
    pagination_class = StandardResultsSetPagination
    serializer_class = SettingsUserListSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.all().order_by('-created_at')

        if not (user.is_superuser or user.role_name == 'admin'):
            queryset = queryset.filter(id=user.id)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(username__icontains=search)
                | Q(email__icontains=search)
            )

        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role_name=role)

        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateUserSerializer
        if self.action in ['update', 'partial_update']:
            return SettingsUserWriteSerializer
        return SettingsUserListSerializer

    def _is_admin_user(self, user):
        return bool(user and (user.is_superuser or user.role_name == 'admin'))

    def _admin_required_response(self):
        return Response(
            {"detail": "Only administrators can manage users."},
            status=status.HTTP_403_FORBIDDEN,
        )

    def create(self, request, *args, **kwargs):
        if not self._is_admin_user(request.user):
            return self._admin_required_response()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        response_serializer = SettingsUserListSerializer(user, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        if not self._is_admin_user(request.user):
            return self._admin_required_response()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not self._is_admin_user(request.user):
            return self._admin_required_response()
        instance = self.get_object()
        if request.user.id == instance.id:
            return Response({"detail": "You cannot delete your own account."}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['patch'])
    def permissions(self, request, pk=None):
        if not self._is_admin_user(request.user):
            return self._admin_required_response()
        user = self.get_object()
        selected_modules = set(request.data.get("permissions", []))

        if not selected_modules:
            return Response({"details": "Permissions Not Provided!"}, status=status.HTTP_400_BAD_REQUEST)

        UserPermission.objects.filter(user=user).delete()

        for module, _ in Permission.MODULES:
            permissions = Permission.objects.filter(module=module)
            allow = module in selected_modules
            for permission in permissions:
                UserPermission.objects.create(user=user, permission=permission, allow=allow)

        return Response({"message": "Permissions set successfully"}, status=status.HTTP_200_OK)


class UsersViewSet(SettingsUsersViewSet):
    permission_module = 'users'


class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer

    def _is_admin_user(self, user):
        return bool(user and (user.is_superuser or user.role_name == 'admin'))

    def create(self, request, *args, **kwargs):
        if not self._is_admin_user(request.user):
            return Response(
                {"detail": "Only administrators can create notifications."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        recipient = serializer.validated_data.get('recipient') or request.user
        notification = Notification.objects.create(
            recipient=recipient,
            created_by=request.user,
            title=serializer.validated_data['title'],
            message=serializer.validated_data['message'],
            notification_type=serializer.validated_data.get('notification_type', Notification.TYPE_INFO),
        )
        return Response(NotificationSerializer(notification).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        notification = self.get_object()
        is_read = request.data.get('is_read', request.data.get('isRead'))
        if is_read is None:
            return Response({'detail': 'is_read is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if isinstance(is_read, str):
            is_read = is_read.lower() in ['1', 'true', 'yes', 'on']
        else:
            is_read = bool(is_read)

        notification.is_read = is_read
        notification.read_at = timezone.now() if is_read else None
        notification.save(update_fields=['is_read', 'read_at', 'updated_at'])
        return Response(NotificationSerializer(notification).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at', 'updated_at'])
        return Response(NotificationSerializer(notification).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['patch'], url_path='mark-all-read')
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True, read_at=timezone.now())
        return Response({'updated': updated}, status=status.HTTP_200_OK)

      
class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        summary = {
            'books': {
                'total': Book.objects.count(),
                'in_stock': Book.objects.filter(quantity__gt=0).count(),
                'out_of_stock': Book.objects.filter(quantity=0).count(),
            },
            'sales': {
                'count': Sale.objects.count(),
                'total_amount': self._decimal_to_string(
                    Sale.objects.aggregate(total=Sum('total_amount'))['total']
                ),
            },
            'employees': {
                'total': Employee.objects.count(),
                'active': Employee.objects.filter(status=Employee.STATUS_ACTIVE).count(),
            },
            'customers': {
                'total': Customer.objects.count(),
                'active': Customer.objects.filter(is_active=True).count(),
            },
            'lending': {
                'total': Lending.objects.count(),
                'returned': Lending.objects.filter(status=Lending.STATUS_RETURNED).count(),
                'not_returned': Lending.objects.filter(status=Lending.STATUS_NOT_RETURNED).count(),
            },
            'expenses': {
                'count': Expense.objects.count(),
                'total_amount': self._decimal_to_string(
                    Expense.objects.aggregate(total=Sum('amount'))['total']
                ),
            },
        }
        return Response(summary)

    def _decimal_to_string(self, value):
        if value is None:
            value = Decimal('0.00')
        return str(Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


class SystemReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        default_start = today - timedelta(days=29)

        start_date = parse_date(request.query_params.get('start_date', '')) or default_start
        end_date = parse_date(request.query_params.get('end_date', '')) or today

        if end_date < start_date:
            return Response({'detail': 'end_date cannot be earlier than start_date.'}, status=status.HTTP_400_BAD_REQUEST)

        sales_qs = Sale.objects.filter(sale_date__date__range=(start_date, end_date))
        expenses_qs = Expense.objects.filter(payment_date__range=(start_date, end_date))
        lendings_qs = Lending.objects.filter(start_date__range=(start_date, end_date))

        sales_total = sales_qs.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        expenses_total = expenses_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        top_books = list(
            lendings_qs.values('book__id', 'book__title')
            .annotate(total_lendings=Count('id'))
            .order_by('-total_lendings', 'book__title')[:5]
        )
        top_expense_categories = list(
            expenses_qs.values('category')
            .annotate(total_amount=Sum('amount'), entries=Count('id'))
            .order_by('-total_amount', 'category')[:5]
        )

        for row in top_expense_categories:
            row['total_amount'] = self._money(row['total_amount'])

        data = {
            'period': {
                'start_date': str(start_date),
                'end_date': str(end_date),
            },
            'overview': {
                'books_total': Book.objects.count(),
                'employees_total': Employee.objects.count(),
                'customers_total': Customer.objects.count(),
                'lendings_total': Lending.objects.count(),
                'sales_total': Sale.objects.count(),
                'expenses_total': Expense.objects.count(),
            },
            'financial': {
                'sales_total_amount': self._money(sales_total),
                'expenses_total_amount': self._money(expenses_total),
                'net_amount': self._money(sales_total - expenses_total),
            },
            'lending': {
                'total_in_period': lendings_qs.count(),
                'returned_in_period': lendings_qs.filter(status=Lending.STATUS_RETURNED).count(),
                'not_returned_in_period': lendings_qs.filter(status=Lending.STATUS_NOT_RETURNED).count(),
                'overdue_now': Lending.objects.filter(
                    status=Lending.STATUS_NOT_RETURNED,
                    end_date__lt=today,
                ).count(),
            },
            'top_books_by_lending': top_books,
            'top_expense_categories': top_expense_categories,
        }
        return Response(data)

    def _money(self, value):
        if value is None:
            value = Decimal('0.00')
        return str(Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


class InitializeView(PermissionMixin, APIView):
    def get(self, request):
        return Response(_get_initial_data(request))
    
    
def _get_initial_data(request):
    
    return {
        "settings": _get_settings(request)
    }

def _get_settings(request):
    
    keys = ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'from_email']
    settings = Settings.objects.filter(setting_key__in=keys)
    email_settings = {key: "" for key in keys}
    for s in settings:
        email_settings[s.setting_key] = s.get_typed_value()
    # Never return smtp_password if you want security
    email_settings['smtp_password'] = None
    key = 'shop_logo'
    try:
        setting = Settings.objects.get(setting_key=key, setting_type='image')
        logo_url = request.build_absolute_uri(setting.get_typed_value())
        logo_settings = {'logo': logo_url}
    except Settings.DoesNotExist:
        logo_settings = {'logo': None}

    keys = ['shop_name', 'phone_number', 'contact_email', 'address']

    settings = Settings.objects.filter(setting_key__in=keys)
    shop_settings = {key: "" for key in keys}
    for s in settings:
        shop_settings[s.setting_key] = s.get_typed_value()

    return {
        "shop_settings": shop_settings,
        "logo_settings": logo_settings,
        "email_settings": email_settings,
        "system_settings": _get_system_settings_data(),
    }


def _get_system_settings_data():
    keys = ['max_books_per_member', 'max_lending_days', 'fine_per_day', 'allow_renewal']
    data = {
        'max_books_per_member': 3,
        'max_lending_days': 14,
        'fine_per_day': 0.0,
        'allow_renewal': True,
    }
    settings = Settings.objects.filter(setting_key__in=keys)
    for s in settings:
        data[s.setting_key] = s.get_typed_value()
    return data
