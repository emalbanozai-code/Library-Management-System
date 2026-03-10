from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User


class CreateUserAPITestCase(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="users_admin",
            email="users_admin@example.com",
            password="AdminPass123!",
            role_name="admin",
            is_superuser=True,
            is_staff=True,
        )
        self.staff_user = User.objects.create_user(
            username="users_staff",
            email="users_staff@example.com",
            password="StaffPass123!",
            role_name="receptionist",
        )
        self.creator_user = User.objects.create_user(
            username="users_creator",
            email="users_creator@example.com",
            password="CreatorPass123!",
            role_name="user_creator",
        )
        self.target_user = User.objects.create_user(
            username="existing.user",
            email="existing.user@example.com",
            password="ExistingPass123!",
            role_name="viewer",
        )
        self.url = "/api/core/users/"
        self.payload = {
            "first_name": "New",
            "last_name": "User",
            "username": "new.user",
            "email": "new.user@example.com",
            "phone": "0700000000",
            "password": "NewUserPass123!",
            "confirm_password": "NewUserPass123!",
            "role_name": "viewer",
            "send_verification_email": False,
        }

    def test_admin_can_create_user(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["username"], self.payload["username"])
        self.assertEqual(response.data["role"], self.payload["role_name"])
        self.assertEqual(response.data["status"], "active")
        self.assertTrue(User.objects.filter(username=self.payload["username"]).exists())

    def test_non_admin_cannot_create_user(self):
        self.client.force_authenticate(user=self.staff_user)

        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(User.objects.filter(username=self.payload["username"]).exists())

    def test_user_creator_can_create_user(self):
        self.client.force_authenticate(user=self.creator_user)

        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username=self.payload["username"]).exists())

    def test_user_creator_cannot_update_user(self):
        self.client.force_authenticate(user=self.creator_user)

        response = self.client.patch(
            f"{self.url}{self.target_user.id}/",
            {"first_name": "Updated"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_creator_cannot_delete_user(self):
        self.client.force_authenticate(user=self.creator_user)

        response = self.client.delete(f"{self.url}{self.target_user.id}/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
