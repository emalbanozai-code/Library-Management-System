from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User

from .models import Employee


class EmployeeAPITestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='employee_admin',
            email='employee_admin@example.com',
            password='TestPass123!',
            role_name='admin',
            is_superuser=True,
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin_user)
        self.list_url = '/api/employees/'

    def _payload(self, **overrides):
        payload = {
            'first_name': 'John',
            'last_name': 'Doe',
            'father_name': 'Robert Doe',
            'date_of_birth': '1995-05-10',
            'address': 'Kabul, District 4',
            'phone': '+93700000001',
            'email': 'john.doe@example.com',
            'salary': '500.00',
            'work_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'join_date': '2024-01-01',
            'membership_type': 'permanent',
            'role': 'receptionist',
            'status': 'active',
            'username': 'john.doe',
            'password': 'StrongPass123!',
        }
        payload.update(overrides)
        return payload

    def test_create_employee_success(self):
        response = self.client.post(self.list_url, self._payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Employee.objects.count(), 1)
        employee = Employee.objects.first()
        self.assertEqual(employee.user.username, 'john.doe')
        self.assertTrue(employee.user.check_password('StrongPass123!'))

    def test_create_fails_when_username_duplicate(self):
        User.objects.create_user(
            username='john.doe',
            email='another@example.com',
            password='Pass12345!',
            role_name='receptionist',
        )
        response = self.client.post(self.list_url, self._payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_create_fails_when_email_duplicate(self):
        User.objects.create_user(
            username='another.user',
            email='john.doe@example.com',
            password='Pass12345!',
            role_name='receptionist',
        )
        response = self.client.post(self.list_url, self._payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_update_syncs_role_and_status_with_user(self):
        create_response = self.client.post(self.list_url, self._payload(), format='json')
        employee_id = create_response.data['id']

        response = self.client.patch(
            f'{self.list_url}{employee_id}/',
            {'role': 'viewer', 'status': 'inactive', 'salary': '750.00'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        employee = Employee.objects.get(id=employee_id)
        self.assertEqual(employee.status, Employee.STATUS_INACTIVE)
        self.assertEqual(employee.salary, Decimal('750.00'))
        self.assertEqual(employee.user.role_name, 'viewer')
        self.assertFalse(employee.user.is_active)

    def test_activate_and_deactivate_actions(self):
        create_response = self.client.post(self.list_url, self._payload(status='inactive'), format='json')
        employee_id = create_response.data['id']

        activate_response = self.client.post(f'{self.list_url}{employee_id}/activate/')
        self.assertEqual(activate_response.status_code, status.HTTP_200_OK)

        employee = Employee.objects.get(id=employee_id)
        self.assertEqual(employee.status, Employee.STATUS_ACTIVE)
        self.assertTrue(employee.user.is_active)

        deactivate_response = self.client.post(f'{self.list_url}{employee_id}/deactivate/')
        self.assertEqual(deactivate_response.status_code, status.HTTP_200_OK)

        employee.refresh_from_db()
        self.assertEqual(employee.status, Employee.STATUS_INACTIVE)
        self.assertFalse(employee.user.is_active)

    def test_reset_password_action(self):
        create_response = self.client.post(self.list_url, self._payload(), format='json')
        employee_id = create_response.data['id']

        response = self.client.post(
            f'{self.list_url}{employee_id}/reset-password/',
            {'password': 'NewStrongPass123!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        employee = Employee.objects.get(id=employee_id)
        self.assertTrue(employee.user.check_password('NewStrongPass123!'))

    def test_list_supports_filtering_search_ordering_and_pagination_shape(self):
        self.client.post(self.list_url, self._payload(), format='json')
        self.client.post(
            self.list_url,
            self._payload(
                username='jane.doe',
                email='jane.doe@example.com',
                first_name='Jane',
                salary='900.00',
                membership_type='contract',
                work_days=['monday', 'wednesday'],
            ),
            format='json',
        )

        response = self.client.get(
            self.list_url,
            {
                'search': 'Jane',
                'membership_type': 'contract',
                'ordering': '-salary',
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
        self.assertEqual(response.data['results'][0]['first_name'], 'Jane')

    def test_employees_permission_required_for_non_superuser_without_permissions(self):
        limited_user = User.objects.create_user(
            username='employee_limited',
            email='employee_limited@example.com',
            password='TestPass123!',
            role_name='receptionist',
        )
        self.client.force_authenticate(user=limited_user)

        response = self.client.get(self.list_url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
