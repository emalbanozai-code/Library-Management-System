from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from .models import Customer


class CustomerAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='customers_admin',
            email='customers_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=self.user)
        self.list_url = '/api/customers/'

    def _payload(self, **overrides):
        payload = {
            'first_name': 'John',
            'last_name': 'Doe',
            'phone': '0700123456',
            'email': f"john{Customer.all_objects.count() + 1}@example.com",
            'address': 'Kabul',
            'gender': 'male',
            'total_purchases': '350.75',
            'discount_percent': '10.00',
            'is_active': True,
        }
        payload.update(overrides)
        return payload

    def test_create_customer_success(self):
        response = self.client.post(self.list_url, self._payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['first_name'], 'John')
        self.assertEqual(response.data['last_name'], 'Doe')
        self.assertEqual(Customer.objects.count(), 1)

    def test_create_customer_fails_when_discount_out_of_range(self):
        response = self.client.post(
            self.list_url,
            self._payload(discount_percent='120.00'),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('discount_percent', response.data)

    def test_customer_list_supports_filtering(self):
        Customer.objects.create(**self._payload(first_name='Alice', last_name='A', gender='female'))
        Customer.objects.create(**self._payload(first_name='Bob', last_name='B', gender='male'))

        response = self.client.get(self.list_url, {'gender': 'female', 'search': 'ali'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['first_name'], 'Alice')

    def test_non_admin_can_view_and_create_but_cannot_update_or_delete(self):
        limited_user = User.objects.create_user(
            username='customers_limited',
            email='customers_limited@example.com',
            password='TestPass123!',
            role_name='viewer',
        )
        customer = Customer.objects.create(**self._payload(first_name='Existing', email='existing@example.com'))
        self.client.force_authenticate(user=limited_user)

        list_response = self.client.get(self.list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create_response = self.client.post(self.list_url, self._payload(email='new@example.com'), format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        update_response = self.client.patch(
            f"{self.list_url}{customer.id}/",
            {'first_name': 'Updated'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)

        delete_response = self.client.delete(f"{self.list_url}{customer.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_403_FORBIDDEN)
