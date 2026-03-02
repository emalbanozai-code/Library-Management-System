from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User


class LegacyLibraryAliasTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='legacy_admin',
            email='legacy_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=self.user)

    def test_books_alias_endpoint_available(self):
        response = self.client.get('/api/library/books/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_sales_alias_endpoint_available(self):
        response = self.client.get('/api/library/sales/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_customers_alias_endpoint_available(self):
        response = self.client.get('/api/library/customers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

