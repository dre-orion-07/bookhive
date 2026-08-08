import { apiClient } from "../../lib/apiClient";
import type {
  Notification,
  NotificationsPageResponse,
  NotificationsSummaryResponse,
} from "./notification.types";

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export type NotificationListParams = {
  page?: number;
  limit?: number;
};

export const notificationsService = {
  list: async (params: NotificationListParams = {}): Promise<NotificationsPageResponse> => {
    const response = await apiClient.get<ApiSuccessResponse<NotificationsPageResponse>>(
      "/notifications",
      {
        params,
      }
    );
    return response.data.data;
  },

  unread: async (params: NotificationListParams = {}): Promise<NotificationsSummaryResponse> => {
    const response = await apiClient.get<ApiSuccessResponse<NotificationsSummaryResponse>>(
      "/notifications/unread",
      {
        params,
      }
    );
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiSuccessResponse<{ unreadCount: number }>>(
      "/notifications/unread-count"
    );
    return response.data.data.unreadCount;
  },

  markRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<ApiSuccessResponse<Notification>>(
      `/notifications/${id}/read`
    );
    return response.data.data;
  },

  markAllRead: async (): Promise<{ count: number }> => {
    const response =
      await apiClient.patch<ApiSuccessResponse<{ count: number }>>("/notifications/read-all");
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
