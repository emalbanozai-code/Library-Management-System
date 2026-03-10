import json
from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from employees.models import Employee
from .models import Expense


class ExpenseAPITestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='expenses_admin',
            email='expenses_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin_user)
        self.list_url = '/api/expenses/'
        self.paid_by = self._create_employee(username='expense.staff')
        self.paid_by_two = self._create_employee(username='expense.staff2', email='expense.staff2@example.com')

    def _create_employee(self, username='expense.staff', email='expense.staff@example.com'):
        user = User.objects.create_user(
            username=username,
            email=email,
            password='StrongPass123!',
            role_name='staff',
            first_name='Expense',
            last_name='Officer',
            is_active=True,
        )
        return Employee.objects.create(
            user=user,
            father_name='Parent Name',
            date_of_birth='1995-01-01',
            address='Kabul',
            salary='500.00',
            work_days=json.dumps(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
            join_date='2024-01-01',
            membership_type=Employee.MEMBERSHIP_PERMANENT,
            status=Employee.STATUS_ACTIVE,
        )

    def _payload(self, **overrides):
        payload = {
            'title': 'Electricity Bill',
            'description': 'Monthly electricity payment',
            'amount': '4500.00',
            'payment_date': str(timezone.localdate()),
            'paid_by': self.paid_by.id,
            'category': Expense.CATEGORY_ELECTRICITY,
        }
        payload.update(overrides)
        return payload

    def test_create_expense_success(self):
        response = self.client.post(self.list_url, self._payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Electricity Bill')
        self.assertEqual(response.data['category'], Expense.CATEGORY_ELECTRICITY)
        self.assertEqual(Expense.objects.count(), 1)

    def test_create_fails_with_non_positive_amount(self):
        response = self.client.post(self.list_url, self._payload(amount='0.00'), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', response.data)

    def test_create_fails_with_future_payment_date(self):
        tomorrow = timezone.localdate() + timedelta(days=1)
        response = self.client.post(self.list_url, self._payload(payment_date=str(tomorrow)), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('payment_date', response.data)

    def test_update_expense_success(self):
        create_response = self.client.post(self.list_url, self._payload(), format='json')
        expense_id = create_response.data['id']

        response = self.client.patch(
            f"{self.list_url}{expense_id}/",
            {
                'title': 'Rent Payment',
                'amount': '8000.00',
                'category': Expense.CATEGORY_RENT,
                'paid_by': self.paid_by_two.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expense = Expense.objects.get(id=expense_id)
        self.assertEqual(expense.title, 'Rent Payment')
        self.assertEqual(expense.amount, Decimal('8000.00'))
        self.assertEqual(expense.category, Expense.CATEGORY_RENT)
        self.assertEqual(expense.paid_by_id, self.paid_by_two.id)

    def test_list_supports_filtering_search_ordering_and_pagination_shape(self):
        self.client.post(self.list_url, self._payload(), format='json')
        self.client.post(
            self.list_url,
            self._payload(
                title='Salary Payment',
                description='Teacher salary payout',
                amount='12000.00',
                category=Expense.CATEGORY_SALARY,
                paid_by=self.paid_by_two.id,
            ),
            format='json',
        )

        response = self.client.get(
            self.list_url,
            {
                'category': Expense.CATEGORY_SALARY,
                'search': 'salary',
                'ordering': '-amount',
                'page': 1,
                'page_size': 10,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Salary Payment')

    def test_delete_expense_soft_delete(self):
        create_response = self.client.post(self.list_url, self._payload(), format='json')
        expense_id = create_response.data['id']

        response = self.client.delete(f"{self.list_url}{expense_id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Expense.objects.filter(id=expense_id).exists())
        self.assertTrue(Expense.all_objects.filter(id=expense_id).exists())

    def test_non_admin_can_view_and_create_but_cannot_update_or_delete(self):
        limited_user = User.objects.create_user(
            username='expenses_limited',
            email='expenses_limited@example.com',
            password='TestPass123!',
            role_name='viewer',
        )
        create_response = self.client.post(self.list_url, self._payload(), format='json')
        expense_id = create_response.data['id']

        self.client.force_authenticate(user=limited_user)

        list_response = self.client.get(self.list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        new_response = self.client.post(
            self.list_url,
            self._payload(title='Stationery', amount='200.00'),
            format='json',
        )
        self.assertEqual(new_response.status_code, status.HTTP_201_CREATED)

        update_response = self.client.patch(
            f"{self.list_url}{expense_id}/",
            {'title': 'Updated'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)

        delete_response = self.client.delete(f"{self.list_url}{expense_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_403_FORBIDDEN)
