from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from .models import Book


class BookAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='book_admin',
            email='book_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=self.user)
        self.list_url = '/api/books/'
        self.alias_list_url = '/api/library/books/'

    def _book_payload(self, **overrides):
        payload = {
            'title': 'Clean Architecture',
            'author': 'Robert C. Martin',
            'isbn': '9780134494166',
            'category': 'Software',
            'price': '49.99',
            'rentable': True,
            'quantity': 10,
            'available_quantity': 8,
            'publisher': 'Pearson',
            'publish_date': '2017-09-20',
            'description': 'A handbook of software craftsmanship.',
        }
        payload.update(overrides)
        return payload

    def _create_book(self, **overrides):
        data = {
            'title': 'Default Book',
            'author': 'Unknown Author',
            'isbn': f"ISBN-{Book.all_objects.count() + 1}",
            'category': 'General',
            'price': Decimal('10.00'),
            'rentable': True,
            'quantity': 10,
            'available_quantity': 10,
            'publisher': 'Default Publisher',
            'description': '',
        }
        data.update(overrides)
        return Book.objects.create(**data)

    def test_create_book_success(self):
        response = self.client.post(self.list_url, self._book_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Clean Architecture')
        self.assertEqual(Book.objects.count(), 1)

    def test_create_fails_when_isbn_duplicate(self):
        Book.objects.create(**self._book_payload())

        response = self.client.post(
            self.list_url,
            self._book_payload(title='Another Book'),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('isbn', response.data)

    def test_create_fails_when_available_quantity_exceeds_quantity(self):
        response = self.client.post(
            self.list_url,
            self._book_payload(quantity=5, available_quantity=9),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('available_quantity', response.data)

    def test_legacy_books_alias_works(self):
        response = self.client.post(self.alias_list_url, self._book_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_books_permission_required_for_non_superuser(self):
        limited_user = User.objects.create_user(
            username='book_limited',
            email='book_limited@example.com',
            password='TestPass123!',
            role_name='viewer',
        )
        self.client.force_authenticate(user=limited_user)

        response = self.client.get(self.list_url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
