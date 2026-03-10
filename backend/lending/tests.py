from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from books.models import Book, BookCategory
from customers.models import Customer
from .models import Lending


class LendingAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='lending_admin',
            email='lending_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=self.user)
        self.list_url = '/api/lending/'
        self.category = BookCategory.objects.create(name='General')

        self.book_one = Book.objects.create(
            title='Lending Book One',
            author='Author One',
            isbn='LENDING-BOOK-1',
            category=self.category,
            price=Decimal('10.00'),
            rentable=True,
            quantity=5,
            publisher='Publisher One',
        )
        self.book_two = Book.objects.create(
            title='Lending Book Two',
            author='Author Two',
            isbn='LENDING-BOOK-2',
            category=self.category,
            price=Decimal('12.00'),
            rentable=True,
            quantity=5,
            publisher='Publisher Two',
        )
        self.customer = Customer.objects.create(
            first_name='John',
            last_name='Doe',
            phone='0700123456',
            email='john@example.com',
            address='Kabul',
            gender='male',
            total_purchases='0.00',
            discount_percent='0.00',
            is_active=True,
        )

    def _payload(self, **overrides):
        today = timezone.localdate()
        payload = {
            'book': self.book_one.id,
            'customer': self.customer.id,
            'start_date': str(today),
            'end_date': str(today + timedelta(days=5)),
            'rent_price': '120.00',
            'status': Lending.STATUS_NOT_RETURNED,
            'fine_per_day': '15.00',
            'payment_status': Lending.PAYMENT_STATUS_UNPAID,
            'payment_method': Lending.PAYMENT_METHOD_CASH,
        }
        payload.update(overrides)
        return payload

    def _create_lending(self, **overrides):
        response = self.client.post(self.list_url, self._payload(**overrides), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response.data

    def test_create_lending_success_and_book_stock_decreases(self):
        response = self.client.post(self.list_url, self._payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], Lending.STATUS_NOT_RETURNED)
        self.book_one.refresh_from_db()
        self.assertEqual(self.book_one.quantity, 4)

    def test_create_lending_fails_when_book_not_available(self):
        self.book_one.quantity = 0
        self.book_one.save(update_fields=['quantity'])

        response = self.client.post(self.list_url, self._payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('book', response.data)
        self.assertEqual(Lending.objects.count(), 0)

    def test_update_lending_book_rebalances_stock(self):
        lending = self._create_lending()
        self.book_one.refresh_from_db()
        self.book_two.refresh_from_db()
        self.assertEqual(self.book_one.quantity, 4)
        self.assertEqual(self.book_two.quantity, 5)

        response = self.client.put(
            f"{self.list_url}{lending['id']}/",
            self._payload(book=self.book_two.id),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.book_one.refresh_from_db()
        self.book_two.refresh_from_db()
        self.assertEqual(self.book_one.quantity, 5)
        self.assertEqual(self.book_two.quantity, 4)

    def test_mark_as_returned_updates_status_fine_and_stock(self):
        today = timezone.localdate()
        lending = self._create_lending(
            start_date=str(today - timedelta(days=10)),
            end_date=str(today - timedelta(days=3)),
            fine_per_day='20.00',
        )

        response = self.client.post(
            f"{self.list_url}{lending['id']}/return/",
            {'payment_status': Lending.PAYMENT_STATUS_PAID, 'payment_method': Lending.PAYMENT_METHOD_CARD},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], Lending.STATUS_RETURNED)
        self.assertEqual(response.data['payment_status'], Lending.PAYMENT_STATUS_PAID)
        self.assertGreaterEqual(response.data['late_days'], 3)
        self.assertGreaterEqual(Decimal(response.data['fine_amount']), Decimal('60.00'))

        self.book_one.refresh_from_db()
        self.assertEqual(self.book_one.quantity, 5)

    def test_delete_not_returned_lending_restores_stock_and_soft_deletes(self):
        lending = self._create_lending()

        response = self.client.delete(f"{self.list_url}{lending['id']}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Lending.objects.filter(id=lending['id']).exists())
        self.assertTrue(Lending.all_objects.filter(id=lending['id']).exists())
        self.book_one.refresh_from_db()
        self.assertEqual(self.book_one.quantity, 5)

    def test_lending_filters_work(self):
        today = timezone.localdate()
        self._create_lending(
            start_date=str(today - timedelta(days=3)),
            end_date=str(today - timedelta(days=1)),
        )
        self._create_lending(
            book=self.book_two.id,
            status=Lending.STATUS_RETURNED,
            payment_status=Lending.PAYMENT_STATUS_PAID,
            end_date=str(today + timedelta(days=1)),
        )

        response = self.client.get(self.list_url, {'overdue_only': 'true'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

        response = self.client.get(self.list_url, {'payment_status': Lending.PAYMENT_STATUS_PAID})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_non_admin_can_view_and_create_but_cannot_update_delete_or_return(self):
        limited_user = User.objects.create_user(
            username='lending_limited',
            email='lending_limited@example.com',
            password='TestPass123!',
            role_name='viewer',
        )
        self.client.force_authenticate(user=limited_user)

        list_response = self.client.get(self.list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create_response = self.client.post(self.list_url, self._payload(), format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        lending_id = create_response.data['id']
        update_response = self.client.patch(
            f"{self.list_url}{lending_id}/",
            {'payment_status': Lending.PAYMENT_STATUS_PAID},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)

        return_response = self.client.post(
            f"{self.list_url}{lending_id}/return/",
            {'payment_status': Lending.PAYMENT_STATUS_PAID},
            format='json',
        )
        self.assertEqual(return_response.status_code, status.HTTP_403_FORBIDDEN)

        delete_response = self.client.delete(f"{self.list_url}{lending_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_403_FORBIDDEN)
