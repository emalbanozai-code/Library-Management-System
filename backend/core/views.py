from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Sum
from django.db.models import Count
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


from .models import (
    Settings
)
from .serializers import (
    EmailSettingsSerializer, ShopSettingsSerializer
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

        # PUT logic: handle file upload
        file = request.FILES.get('logo')
        if not file:
            return Response({'error': 'No file uploaded'}, status=400)

        setting, created = Settings.objects.get_or_create(
            setting_key=key,
            defaults={
                'setting_type': 'image',
                'category': 'branding',
                'description': 'Shop logo',
            }
        )

        setting.setting_image = file
        setting.save()
        logo_url = request.build_absolute_uri(setting.get_typed_value())

        return Response({'logo': logo_url}, status=200)

      
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
        "email_settings": email_settings
    }
