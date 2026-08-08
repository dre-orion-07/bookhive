import { NotificationType } from "@prisma/client";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import { usersRepository } from "../users/users.repository.js";
import { followsRepository } from "../follows/follows.repository.js";
import { booksRepository } from "../books/books.repository.js";
import { clubsRepository } from "../clubs/clubs.repository.js";
import { notificationsRepository, type NotificationRecord } from "./notifications.repository.js";
import {
  emitNotificationCount,
  emitNotificationCreated,
  emitNotificationDeleted,
  emitNotificationRead,
} from "./notifications.socket.js";

type NotificationInput = {
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  entityId: string;
  entityType: string;
};

function actorLabel(displayName?: string | null, username?: string | null) {
  return displayName?.trim() || username?.trim() || "Someone";
}

async function createAndDispatchNotification(
  input: NotificationInput
): Promise<NotificationRecord> {
  const notification = await notificationsRepository.create({
    recipientId: input.recipientId,
    actorId: input.actorId ?? null,
    type: input.type,
    title: input.title,
    body: input.body,
    entityId: input.entityId,
    entityType: input.entityType,
    read: false,
  });

  emitNotificationCreated(input.recipientId, notification);
  const unreadCount = await notificationsRepository.countUnreadForRecipient(input.recipientId);
  emitNotificationCount(input.recipientId, unreadCount);

  return notification;
}

async function notifyMany(
  recipients: string[],
  inputFactory: (recipientId: string) => NotificationInput
) {
  return Promise.all(
    recipients.map((recipientId) => createAndDispatchNotification(inputFactory(recipientId)))
  );
}

export const notificationsService = {
  list: async (recipientId: string, page = 1, limit = 20) => {
    return notificationsRepository.listForRecipient(recipientId, page, limit);
  },

  unread: async (recipientId: string, page = 1, limit = 20) => {
    return notificationsRepository.listUnreadForRecipient(recipientId, page, limit);
  },

  getUnreadCount: async (recipientId: string) => {
    return notificationsRepository.countUnreadForRecipient(recipientId);
  },

  markAsRead: async (recipientId: string, notificationId: string) => {
    const notification = await notificationsRepository.markAsRead(recipientId, notificationId);
    if (!notification) {
      throw ErrorFactory.validation("Notification not found.");
    }

    const unreadCount = await notificationsRepository.countUnreadForRecipient(recipientId);
    emitNotificationRead(recipientId, { notificationId, unreadCount });
    emitNotificationCount(recipientId, unreadCount);

    return notification;
  },

  markAllAsRead: async (recipientId: string) => {
    const result = await notificationsRepository.markAllAsRead(recipientId);
    emitNotificationRead(recipientId, {
      notificationId: null,
      unreadCount: 0,
      updatedCount: result.count,
    });
    emitNotificationCount(recipientId, 0);
    return result;
  },

  delete: async (recipientId: string, notificationId: string) => {
    const deleted = await notificationsRepository.delete(recipientId, notificationId);
    if (!deleted) {
      throw ErrorFactory.validation("Notification not found.");
    }

    const unreadCount = await notificationsRepository.countUnreadForRecipient(recipientId);
    emitNotificationDeleted(recipientId, { notificationId });
    emitNotificationCount(recipientId, unreadCount);

    return deleted;
  },

  createSystemNotification: async (
    recipientId: string,
    title: string,
    body: string,
    entityId = "system"
  ) => {
    return createAndDispatchNotification({
      recipientId,
      type: NotificationType.SYSTEM,
      title,
      body,
      entityId,
      entityType: "system",
    });
  },

  notifyNewFollower: async (followerId: string, followingId: string) => {
    const [actor, recipient] = await Promise.all([
      usersRepository.findById(followerId),
      usersRepository.findById(followingId),
    ]);

    if (!recipient || !actor) {
      return null;
    }

    return createAndDispatchNotification({
      recipientId: followingId,
      actorId: followerId,
      type: NotificationType.FOLLOW,
      title: "New follower",
      body: `${actorLabel(actor.displayName, actor.username)} started following you.`,
      entityId: followerId,
      entityType: "user",
    });
  },

  notifyNewReview: async (reviewerId: string, bookId: string) => {
    const [actor, book] = await Promise.all([
      usersRepository.findById(reviewerId),
      booksRepository.findById(bookId),
    ]);

    if (!actor || !book) {
      return [];
    }

    const followers = await followsRepository.listFollowers(reviewerId);
    const recipientIds = followers
      .map((relation) => relation.followerId)
      .filter((recipientId) => recipientId !== reviewerId);

    return notifyMany(recipientIds, (recipientId) => ({
      recipientId,
      actorId: reviewerId,
      type: NotificationType.REVIEW_COMMENT,
      title: "New review posted",
      body: `${actorLabel(actor.displayName, actor.username)} reviewed ${book.title}.`,
      entityId: bookId,
      entityType: "book",
    }));
  },

  notifyDirectMessage: async (
    conversationId: string,
    senderId: string,
    participantIds: string[],
    content: string
  ) => {
    const actor = await usersRepository.findById(senderId);
    if (!actor) {
      return [];
    }

    const recipients = participantIds.filter((recipientId) => recipientId !== senderId);
    const preview = content.trim().slice(0, 100) || "Sent you a message.";

    return notifyMany(recipients, (recipientId) => ({
      recipientId,
      actorId: senderId,
      type: NotificationType.MESSAGE,
      title: `${actorLabel(actor.displayName, actor.username)} sent a message`,
      body: preview,
      entityId: conversationId,
      entityType: "conversation",
    }));
  },

  notifyClubJoin: async (clubId: string, actorId: string) => {
    const [actor, club] = await Promise.all([
      usersRepository.findById(actorId),
      clubsRepository.findById(clubId),
    ]);

    if (!actor || !club) {
      return null;
    }

    return createAndDispatchNotification({
      recipientId: club.ownerId,
      actorId,
      type: NotificationType.CLUB_JOIN,
      title: "New club member",
      body: `${actorLabel(actor.displayName, actor.username)} joined ${club.name}.`,
      entityId: clubId,
      entityType: "club",
    });
  },

  notifyClubDiscussion: async (clubId: string, actorId: string, discussionTitle: string) => {
    const [actor, club, members] = await Promise.all([
      usersRepository.findById(actorId),
      clubsRepository.findById(clubId),
      clubsRepository.listMembers(clubId),
    ]);

    if (!actor || !club) {
      return [];
    }

    const recipientIds = members
      .map((member) => member.userId)
      .filter((recipientId) => recipientId !== actorId);

    return notifyMany(recipientIds, (recipientId) => ({
      recipientId,
      actorId,
      type: NotificationType.CLUB_DISCUSSION,
      title: `${actorLabel(actor.displayName, actor.username)} started a discussion`,
      body: discussionTitle,
      entityId: clubId,
      entityType: "club",
    }));
  },

  notifyClubEvent: async (clubId: string, actorId: string, eventTitle: string) => {
    const [actor, club, members] = await Promise.all([
      usersRepository.findById(actorId),
      clubsRepository.findById(clubId),
      clubsRepository.listMembers(clubId),
    ]);

    if (!actor || !club) {
      return [];
    }

    const recipientIds = members
      .map((member) => member.userId)
      .filter((recipientId) => recipientId !== actorId);

    return notifyMany(recipientIds, (recipientId) => ({
      recipientId,
      actorId,
      type: NotificationType.CLUB_EVENT,
      title: `${actorLabel(actor.displayName, actor.username)} scheduled an event`,
      body: eventTitle,
      entityId: clubId,
      entityType: "club",
    }));
  },

  notifyDiscussionReply: async (
    clubId: string,
    discussionId: string,
    actorId: string,
    replyPreview: string
  ) => {
    const [actor, discussion, club] = await Promise.all([
      usersRepository.findById(actorId),
      clubsRepository.findDiscussionById(discussionId),
      clubsRepository.findById(clubId),
    ]);

    if (!actor || !discussion || !club) {
      return null;
    }

    if (discussion.authorId === actorId) {
      return null;
    }

    return createAndDispatchNotification({
      recipientId: discussion.authorId,
      actorId,
      type: NotificationType.DISCUSSION_REPLY,
      title: `${actorLabel(actor.displayName, actor.username)} replied to your discussion`,
      body: replyPreview,
      entityId: clubId,
      entityType: "club",
    });
  },
};
