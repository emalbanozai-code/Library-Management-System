from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from books.models import Book
from .models import Customer, Sale


class SalesAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='sales_admin',
            email='sales_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=self.user)

        self.sales_url = '/api/sales/'
        self.customers_url = '/api/sales/customers/'

        self.book_one = Book.objects.create(
            title='Book One',
            author='Author One',
            isbn='BOOK-1',
            category='Test',
            price=Decimal('20.00'),
            quantity=50,
            available_quantity=50,
            publisher='Test Publisher',
        )
        self.book_two = Book.objects.create(
            title='Book Two',
            author='Author Two',
            isbn='BOOK-2',
            category='Test',
            price=Decimal('30.00'),
            quantity=30,
            available_quantity=30,
            publisher='Test Publisher',
        )

    def _create_customer(self, **overrides):
        data = {
            'full_name': 'Customer One',
            'phone': '123456789',
            'email': f"customer{Customer.all_objects.count() + 1}@example.com",
            'notes': '',
        }
        data.update(overrides)
        return Customer.objects.create(**data)

    def _sale_payload(self, **overrides):
        payload = {
            'customer': None,
            'discount_percent': '0.00',
            'notes': 'Test sale',
            'items': [
                {'book': self.book_one.id, 'quantity': 2, 'unit_price': '20.00'},
            ],
        }
        payload.update(overrides)
        return payload

    def _create_sale_via_api(self, **overrides):
        response = self.client.post(self.sales_url, self._sale_payload(**overrides), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response.data

    def test_sale_create_success_without_status_field(self):
        response = self.client.post(self.sales_url, self._sale_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('status', response.data)
        self.assertEqual(Decimal(response.data['subtotal_amount']), Decimal('40.00'))
        self.assertEqual(Decimal(response.data['discount_percent']), Decimal('0.00'))
        self.assertEqual(Decimal(response.data['discount_amount']), Decimal('0.00'))
        self.assertEqual(Decimal(response.data['total_amount']), Decimal('40.00'))

    def test_sale_update_success(self):
        sale = self._create_sale_via_api()
        customer = self._create_customer()

        response = self.client.put(
            f"{self.sales_url}{sale['id']}/",
            {
                'customer': customer.id,
                'notes': 'Updated sale',
                'discount_percent': '12.50',
                'items': [
                    {'book': self.book_two.id, 'quantity': 2, 'unit_price': '30.00'},
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('status', response.data)
        self.assertEqual(Decimal(response.data['subtotal_amount']), Decimal('60.00'))
        self.assertEqual(Decimal(response.data['discount_percent']), Decimal('12.50'))
        self.assertEqual(Decimal(response.data['discount_amount']), Decimal('7.50'))
        self.assertEqual(Decimal(response.data['total_amount']), Decimal('52.50'))

    def test_sale_delete_success_for_any_sale(self):
        sale = self._create_sale_via_api()

        response = self.client.delete(f"{self.sales_url}{sale['id']}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Sale.objects.filter(id=sale['id']).exists())
        self.assertTrue(Sale.all_objects.filter(id=sale['id']).exists())

    def test_complete_and_cancel_endpoints_removed(self):
        sale = self._create_sale_via_api()

        complete_response = self.client.post(f"{self.sales_url}{sale['id']}/complete/")
        cancel_response = self.client.post(f"{self.sales_url}{sale['id']}/cancel/")

        self.assertEqual(complete_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(cancel_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_customer_aggregates_update_after_create_update_delete(self):
        customer = self._create_customer()
        sale = self._create_sale_via_api(
            customer=customer.id,
            items=[{'book': self.book_one.id, 'quantity': 1, 'unit_price': '20.00'}],
        )

        customer.refresh_from_db()
        self.assertEqual(customer.total_completed_sales, 1)
        self.assertEqual(customer.total_spent, Decimal('20.00'))
        self.assertIsNotNone(customer.last_purchase_date)

        update_response = self.client.put(
            f"{self.sales_url}{sale['id']}/",
            {
                'customer': customer.id,
                'discount_percent': '0.00',
                'notes': 'Updated',
                'items': [{'book': self.book_one.id, 'quantity': 2, 'unit_price': '20.00'}],
            },
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        customer.refresh_from_db()
        self.assertEqual(customer.total_completed_sales, 1)
        self.assertEqual(customer.total_spent, Decimal('40.00'))

        delete_response = self.client.delete(f"{self.sales_url}{sale['id']}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        customer.refresh_from_db()
        self.assertEqual(customer.total_completed_sales, 0)
        self.assertEqual(customer.total_spent, Decimal('0.00'))

    def test_customer_purchase_history_returns_summary_and_records(self):
        customer = self._create_customer()

        self._create_sale_via_api(
            customer=customer.id,
            items=[{'book': self.book_one.id, 'quantity': 2, 'unit_price': '20.00'}],
        )
        self._create_sale_via_api(
            customer=customer.id,
            items=[{'book': self.book_two.id, 'quantity': 1, 'unit_price': '30.00'}],
        )

        response = self.client.get(f"{self.customers_url}{customer.id}/purchase-history/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['summary']['total_completed_sales'], 2)
        self.assertNotIn('status', response.data['results'][0])

    def test_auth_required_for_sales_and_customers(self):
        self.client.force_authenticate(user=None)

        sales_response = self.client.get(self.sales_url)
        customers_response = self.client.get(self.customers_url)

        self.assertIn(sales_response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
        self.assertIn(customers_response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_sales_list_filter_ordering_and_pagination_shape(self):
        customer = self._create_customer()

        self._create_sale_via_api(
            customer=customer.id,
            items=[{'book': self.book_one.id, 'quantity': 1, 'unit_price': '20.00'}],
        )
        self._create_sale_via_api(
            customer=customer.id,
            items=[{'book': self.book_two.id, 'quantity': 2, 'unit_price': '30.00'}],
        )

        response = self.client.get(
            self.sales_url,
            {'min_total': '20', 'ordering': '-total_amount'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertIn('results', response.data)
        self.assertGreaterEqual(len(response.data['results']), 2)
        self.assertGreaterEqual(
            Decimal(response.data['results'][0]['total_amount']),
            Decimal(response.data['results'][1]['total_amount']),
        )

    def test_legacy_sales_alias_works(self):
        response = self.client.get('/api/library/sales/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_sales_permission_required_for_non_superuser(self):
        limited_user = User.objects.create_user(
            username='sales_limited',
            email='sales_limited@example.com',
            password='TestPass123!',
            role_name='viewer',
        )
        self.client.force_authenticate(user=limited_user)

        sales_response = self.client.get(self.sales_url)
        customers_response = self.client.get(self.customers_url)
        self.assertIn(sales_response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
        self.assertIn(customers_response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
