import type { NextFunction, Response } from "express";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";
import { notificationIdSchema, notificationPaginationSchema } from "./notifications.schema.js";
import { notificationsService } from "./notifications.service.js";

function getUserId(req: AuthenticatedRequest) {
  const userId = req.user?.userId;
  if (!userId) {
    throw ErrorFactory.authenticationFailed("Authentication token is required.");
  }

  return userId;
}

function parsePagination(query: Record<string, unknown>) {
  const result = notificationPaginationSchema.safeParse(query);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(" ");
    throw ErrorFactory.validation(message);
  }

  return result.data;
}

function parseNotificationId(params: Record<string, unknown>) {
  const result = notificationIdSchema.safeParse(params);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(" ");
    throw ErrorFactory.validation(message);
  }

  return result.data.id;
}

export const notificationsController = {
  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = parsePagination(req.query as Record<string, unknown>);
      const notifications = await notificationsService.list(getUserId(req), page, limit);
      return sendSuccess(res, notifications, "Notifications retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  unread: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = parsePagination(req.query as Record<string, unknown>);
      const notifications = await notificationsService.unread(getUserId(req), page, limit);
      return sendSuccess(res, notifications, "Unread notifications retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  unreadCount: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const count = await notificationsService.getUnreadCount(getUserId(req));
      return sendSuccess(res, { unreadCount: count }, "Unread count retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  markRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const notificationId = parseNotificationId(req.params as Record<string, unknown>);
      const notification = await notificationsService.markAsRead(getUserId(req), notificationId);
      return sendSuccess(res, notification, "Notification marked as read.");
    } catch (err) {
      return next(err);
    }
  },

  markAllRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await notificationsService.markAllAsRead(getUserId(req));
      return sendSuccess(res, result, "All notifications marked as read.");
    } catch (err) {
      return next(err);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const notificationId = parseNotificationId(req.params as Record<string, unknown>);
      await notificationsService.delete(getUserId(req), notificationId);
      return sendSuccess(res, null, "Notification deleted successfully.");
    } catch (err) {
      return next(err);
    }
  },
};
