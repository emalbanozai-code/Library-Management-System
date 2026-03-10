from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from books.models import Book, BookCategory
from core.models import Notification
from customers.models import Customer
from employees.models import Employee
from expenses.models import Expense
from lending.models import Lending
from sales.models import Customer as SalesCustomer, Sale


class DashboardSummaryAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='dashboard_admin',
            email='dashboard_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/api/core/dashboard/summary'

    def test_dashboard_summary_returns_expected_modules_and_values(self):
        category = BookCategory.objects.create(name='Dashboard Category')
        in_stock_book = Book.objects.create(
            title='Book A',
            author='Author A',
            isbn='DASH-BOOK-1',
            category=category,
            price=Decimal('10.00'),
            quantity=5,
            rentable=True,
            publisher='Publisher A',
        )
        Book.objects.create(
            title='Book B',
            author='Author B',
            isbn='DASH-BOOK-2',
            category=category,
            price=Decimal('11.00'),
            quantity=0,
            rentable=True,
            publisher='Publisher B',
        )

        employee_user = User.objects.create_user(
            username='dashboard_employee',
            email='dashboard_employee@example.com',
            password='TestPass123!',
            role_name='receptionist',
            first_name='Dash',
            last_name='Employee',
        )
        employee = Employee.objects.create(
            user=employee_user,
            father_name='Father',
            date_of_birth='1990-01-01',
            address='Kabul',
            salary='500.00',
            work_days='[]',
            join_date='2024-01-01',
            membership_type=Employee.MEMBERSHIP_PERMANENT,
            status=Employee.STATUS_ACTIVE,
        )

        customer = Customer.objects.create(
            first_name='John',
            last_name='Doe',
            phone='0700000000',
            email='dashboard.customer@example.com',
            address='Kabul',
            gender=Customer.GENDER_MALE,
            total_purchases='0.00',
            discount_percent='0.00',
            is_active=True,
        )

        Sale.objects.create(total_amount=Decimal('120.00'))
        Sale.objects.create(total_amount=Decimal('30.00'))

        Expense.objects.create(
            title='Rent',
            description='Monthly rent',
            amount=Decimal('80.50'),
            payment_date=timezone.localdate(),
            paid_by=employee,
            category=Expense.CATEGORY_RENT,
        )

        Lending.objects.create(
            book=in_stock_book,
            customer=customer,
            start_date=timezone.localdate(),
            end_date=timezone.localdate() + timedelta(days=3),
            rent_price=Decimal('20.00'),
            status=Lending.STATUS_NOT_RETURNED,
            fine_per_day=Decimal('2.00'),
            payment_status=Lending.PAYMENT_STATUS_UNPAID,
            payment_method=Lending.PAYMENT_METHOD_CASH,
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['books']['total'], 2)
        self.assertEqual(response.data['books']['in_stock'], 1)
        self.assertEqual(response.data['books']['out_of_stock'], 1)
        self.assertEqual(response.data['sales']['count'], 2)
        self.assertEqual(response.data['sales']['total_amount'], '150.00')
        self.assertEqual(response.data['employees']['total'], 1)
        self.assertEqual(response.data['employees']['active'], 1)
        self.assertEqual(response.data['customers']['total'], 1)
        self.assertEqual(response.data['customers']['active'], 1)
        self.assertEqual(response.data['lending']['total'], 1)
        self.assertEqual(response.data['lending']['returned'], 0)
        self.assertEqual(response.data['lending']['not_returned'], 1)
        self.assertEqual(response.data['expenses']['count'], 1)
        self.assertEqual(response.data['expenses']['total_amount'], '80.50')

    def test_dashboard_summary_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class AutoNotificationAPITestCase(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='notifications_admin',
            email='notifications_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
            first_name='Auto',
            last_name='Admin',
        )
        self.client.force_authenticate(user=self.admin)
        self.category = BookCategory.objects.create(name='Notifications Category')
        self.book = Book.objects.create(
            title='Notifications Book',
            author='Alert Author',
            isbn='NOTIFY-BOOK-1',
            category=self.category,
            price=Decimal('25.00'),
            quantity=10,
            rentable=True,
            publisher='Alert Publisher',
        )

    def test_customer_create_generates_notification(self):
        response = self.client.post(
            '/api/customers/',
            {
                'first_name': 'Ahmad',
                'last_name': 'Khan',
                'phone': '0701000000',
                'email': 'ahmad.khan@example.com',
                'address': 'Kandahar',
                'gender': Customer.GENDER_MALE,
                'total_purchases': '0.00',
                'discount_percent': '0.00',
                'is_active': True,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.admin,
                title='New customer added',
                message__icontains='Ahmad Khan',
            ).exists()
        )

    def test_employee_create_generates_notification(self):
        response = self.client.post(
            '/api/employees/',
            {
                'first_name': 'Fatima',
                'last_name': 'Noori',
                'father_name': 'Karim',
                'date_of_birth': '1995-01-01',
                'address': 'Herat',
                'phone': '0702000000',
                'email': 'fatima.noori@example.com',
                'salary': '800.00',
                'work_days': ['monday', 'tuesday'],
                'join_date': '2024-01-01',
                'membership_type': Employee.MEMBERSHIP_PERMANENT,
                'role': 'receptionist',
                'status': Employee.STATUS_ACTIVE,
                'username': 'fatima.noori',
                'password': 'EmployeePass123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.admin,
                title='New employee added',
                message__icontains='Fatima Noori',
            ).exists()
        )

    def test_sale_create_generates_notification(self):
        sales_customer = SalesCustomer.objects.create(
            full_name='Sale Customer',
            phone='0703000000',
            email='sale.customer@example.com',
            is_active=True,
        )

        response = self.client.post(
            '/api/sales/',
            {
                'customer': sales_customer.id,
                'discount_percent': '0.00',
                'items': [
                    {
                        'book': self.book.id,
                        'quantity': 2,
                        'unit_price': '25.00',
                    }
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.admin,
                title='New sale recorded',
                message__icontains='Sale #',
            ).exists()
        )

    def test_low_stock_book_create_generates_notification(self):
        response = self.client.post(
            '/api/books/',
            {
                'title': 'Low Stock Book',
                'author': 'Stock Author',
                'isbn': 'LOW-STOCK-1',
                'category': self.category.id,
                'price': '15.00',
                'rentable': True,
                'quantity': 3,
                'publisher': 'Stock Publisher',
                'description': '',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.admin,
                title='Low stock alert',
                message__icontains='Low Stock Book',
            ).exists()
        )

    def test_notification_list_generates_overdue_and_stock_alerts(self):
        overdue_customer = Customer.objects.create(
            first_name='Overdue',
            last_name='Reader',
            phone='0704000000',
            email='overdue.reader@example.com',
            address='Kabul',
            gender=Customer.GENDER_MALE,
            total_purchases='0.00',
            discount_percent='0.00',
            is_active=True,
        )
        out_of_stock_book = Book.objects.create(
            title='Out Of Stock Book',
            author='Runtime Author',
            isbn='RUNTIME-STOCK-1',
            category=self.category,
            price='18.00',
            quantity=0,
            rentable=True,
            publisher='Runtime Publisher',
        )
        Lending.objects.create(
            book=self.book,
            customer=overdue_customer,
            start_date=timezone.localdate() - timedelta(days=7),
            end_date=timezone.localdate() - timedelta(days=2),
            rent_price=Decimal('12.00'),
            status=Lending.STATUS_NOT_RETURNED,
            fine_per_day=Decimal('1.50'),
            payment_status=Lending.PAYMENT_STATUS_UNPAID,
            payment_method=Lending.PAYMENT_METHOD_CASH,
        )

        response = self.client.get('/api/core/notifications/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.admin,
                title='Overdue lending alert',
            ).exists()
        )
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.admin,
                title='Book out of stock',
                message__icontains=out_of_stock_book.title,
            ).exists()
        )
