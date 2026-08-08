import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const notificationInclude = {
  actor: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
    },
  },
} as const;

export type NotificationRecord = Prisma.NotificationGetPayload<{
  include: typeof notificationInclude;
}>;

export type NotificationPreferenceRecord = Prisma.NotificationPreferenceGetPayload<object>;

export const notificationsRepository = {
  create: (data: Prisma.NotificationUncheckedCreateInput) => {
    return prisma.notification.create({ data, include: notificationInclude });
  },

  findById: (id: string) => {
    return prisma.notification.findFirst({ where: { id }, include: notificationInclude });
  },

  listForRecipient: async (recipientId: string, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: notificationInclude,
      }),
      prisma.notification.count({ where: { recipientId } }),
      prisma.notification.count({ where: { recipientId, read: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasMore: skip + notifications.length < total,
      },
    };
  },

  listUnreadForRecipient: async (recipientId: string, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId, read: false },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: notificationInclude,
      }),
      prisma.notification.count({ where: { recipientId, read: false } }),
    ]);

    return {
      notifications,
      unreadCount: total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasMore: skip + notifications.length < total,
      },
    };
  },

  countUnreadForRecipient: (recipientId: string) => {
    return prisma.notification.count({ where: { recipientId, read: false } });
  },

  markAsRead: async (recipientId: string, id: string) => {
    const notification = await prisma.notification.findFirst({ where: { id, recipientId } });
    if (!notification) {
      return null;
    }

    return prisma.notification.update({
      where: { id },
      data: { read: true },
      include: notificationInclude,
    });
  },

  markAllAsRead: async (recipientId: string) => {
    return prisma.notification.updateMany({
      where: { recipientId, read: false },
      data: { read: true },
    });
  },

  delete: async (recipientId: string, id: string) => {
    const notification = await prisma.notification.findFirst({ where: { id, recipientId } });
    if (!notification) {
      return null;
    }

    await prisma.notification.delete({ where: { id } });
    return notification;
  },

  getPreference: (userId: string) => {
    return prisma.notificationPreference.findUnique({ where: { userId } });
  },

  upsertPreference: (userId: string, data: Prisma.NotificationPreferenceUncheckedCreateInput) => {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: data,
    });
  },
};
