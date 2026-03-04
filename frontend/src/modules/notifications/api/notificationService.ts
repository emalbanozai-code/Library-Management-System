import apiClient from "@/lib/api";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: NotificationType;
  recipientId?: number;
}

type NotificationApiItem = {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

const toApiPayload = (data: CreateNotificationData) => ({
  title: data.title,
  message: data.message,
  notification_type: data.type ?? "info",
  recipient_id: data.recipientId,
});

export const notificationService = {
  list: async (): Promise<NotificationItem[]> => {
    const { data } = await apiClient.get<NotificationApiItem[]>("/core/notifications/");
    return data;
  },

  create: async (payload: CreateNotificationData): Promise<NotificationItem> => {
    const { data } = await apiClient.post<NotificationApiItem>(
      "/core/notifications/",
      toApiPayload(payload)
    );
    return data;
  },

  markRead: async (id: number): Promise<NotificationItem> => {
    const { data } = await apiClient.patch<NotificationApiItem>(
      `/core/notifications/${id}/mark-read/`
    );
    return data;
  },

  markAllRead: async (): Promise<{ updated: number }> => {
    const { data } = await apiClient.patch<{ updated: number }>(
      "/core/notifications/mark-all-read/"
    );
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/core/notifications/${id}/`);
  },
};

export default notificationService;

