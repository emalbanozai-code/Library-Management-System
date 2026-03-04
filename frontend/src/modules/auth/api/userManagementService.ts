import apiClient from "@/lib/api";
import type { RoleName } from "@/data/roles";
import type { Permission } from "@/data/permissions";

// User List Item
export interface UserListItem {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string | null;
  role: RoleName;
  status: "active" | "inactive";
  lastLogin: string | null;
  createdAt: string;
  avatarUrl: string | null;
  permissions: Permission[];
}

// Paginated Users Response
export interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserListItem[];
}

// Create User Data
export interface CreateUserData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  confirm_password: string;
  role_name: RoleName;
  send_verification_email?: boolean;
}

// Update User Data
export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  role_name?: RoleName;
  is_active?: boolean;
}

// Update Permissions Data
export interface UpdatePermissionsData {
  permissions: Permission[];
}

// User Management Service
export const userManagementService = {
  // Get all users with pagination
  getUsers: (params?: { page?: number; page_size?: number; search?: string; role?: string }) =>
    apiClient.get<PaginatedUsers>("/core/users/", { params }),

  // Get single user
  getUser: (id: number) =>
    apiClient.get<UserListItem>(`/core/users/${id}/`),

  // Create new user
  createUser: (data: CreateUserData) =>
    apiClient.post<UserListItem>("/core/users/", data),

  // Update user
  updateUser: (id: number, data: UpdateUserData) =>
    apiClient.patch<UserListItem>(`/core/users/${id}/`, data),

  // Delete user
  deleteUser: (id: number) =>
    apiClient.delete(`/core/users/${id}/`),

  // Update user permissions
  updatePermissions: (id: number, data: UpdatePermissionsData) =>
    apiClient.patch<UserListItem>(`/core/users/${id}/permissions/`, data),

  // Change user password (admin)
  changeUserPassword: (id: number, data: { new_password: string }) =>
    apiClient.post(`/accounts/users/${id}/change-password/`, data),
};

export default userManagementService;
