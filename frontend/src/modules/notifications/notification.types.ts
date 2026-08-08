export type NotificationType =
  | "MESSAGE"
  | "FOLLOW"
  | "REVIEW_COMMENT"
  | "DISCUSSION_REPLY"
  | "CLUB_JOIN"
  | "CLUB_EVENT"
  | "CLUB_DISCUSSION"
  | "SYSTEM";

export type NotificationActor = {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
};

export type Notification = {
  id: string;
  recipientId: string;
  actorId?: string | null;
  actor?: NotificationActor | null;
  type: NotificationType;
  title: string;
  body: string;
  entityId: string;
  entityType: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type NotificationsPageResponse = {
  notifications: Notification[];
  unreadCount: number;
  pagination: NotificationPagination;
};

export type NotificationsSummaryResponse = {
  notifications: Notification[];
  unreadCount: number;
  pagination: NotificationPagination;
};

export function getNotificationHref(notification: Notification) {
  switch (notification.type) {
    case "MESSAGE":
      return `/messages/${notification.entityId}`;
    case "FOLLOW":
      return "/readers";
    case "REVIEW_COMMENT":
      return `/books/${notification.entityId}`;
    case "DISCUSSION_REPLY":
    case "CLUB_JOIN":
    case "CLUB_EVENT":
    case "CLUB_DISCUSSION":
      return `/clubs/${notification.entityId}`;
    default:
      return null;
  }
}
