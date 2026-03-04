from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from .models import Book, BookCategory


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
        self.category_list_url = '/api/books/categories/'
        self.alias_list_url = '/api/library/books/'
        self.default_category = BookCategory.objects.create(name='Software')

    def _book_payload(self, **overrides):
        payload = {
            'title': 'Clean Architecture',
            'author': 'Robert C. Martin',
            'isbn': '9780134494166',
            'category': self.default_category.id,
            'price': '49.99',
            'rentable': True,
            'quantity': 10,
            'publisher': 'Pearson',
            'publish_date': '2017-09-20',
            'description': 'A handbook of software craftsmanship.',
        }
        payload.update(overrides)
        return payload

    def _create_book(self, **overrides):
        category = overrides.pop('category', None) or self.default_category
        data = {
            'title': 'Default Book',
            'author': 'Unknown Author',
            'isbn': f"ISBN-{Book.all_objects.count() + 1}",
            'category': category,
            'price': Decimal('10.00'),
            'rentable': True,
            'quantity': 10,
            'publisher': 'Default Publisher',
            'description': '',
        }
        data.update(overrides)
        return Book.objects.create(**data)

    def test_create_book_success(self):
        response = self.client.post(self.list_url, self._book_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Clean Architecture')
        self.assertEqual(response.data['category_name'], 'Software')
        self.assertEqual(Book.objects.count(), 1)

    def test_create_fails_when_isbn_duplicate(self):
        Book.objects.create(
            title='Clean Architecture',
            author='Robert C. Martin',
            isbn='9780134494166',
            category=self.default_category,
            price=Decimal('49.99'),
            rentable=True,
            quantity=10,
            publisher='Pearson',
            publish_date='2017-09-20',
            description='A handbook of software craftsmanship.',
        )

        response = self.client.post(
            self.list_url,
            self._book_payload(title='Another Book'),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('isbn', response.data)

    def test_create_fails_when_quantity_negative(self):
        response = self.client.post(
            self.list_url,
            self._book_payload(quantity=-1),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', response.data)

    def test_category_crud_success(self):
        create_response = self.client.post(
            self.category_list_url,
            {'name': 'History', 'description': 'History books'},
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        category_id = create_response.data['id']
        list_response = self.client.get(self.category_list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(list_response.data['count'], 2)

        update_response = self.client.put(
            f"{self.category_list_url}{category_id}/",
            {'name': 'World History', 'description': 'Updated'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['name'], 'World History')

        delete_response = self.client.delete(f"{self.category_list_url}{category_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

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
