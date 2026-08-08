import { Server, Socket } from "socket.io";
import { notificationsRepository } from "./notifications.repository.js";

type SocketUser = {
  userId: string;
  email: string;
};

declare module "socket.io" {
  interface Socket {
    user?: SocketUser;
  }
}

let notificationsIo: Server | null = null;

function getRoom(userId: string) {
  return `notifications:${userId}`;
}

function emitToUser(userId: string, event: string, payload: unknown) {
  notificationsIo?.to(getRoom(userId)).emit(event, payload);
}

export function setupNotificationsSocket(io: Server) {
  notificationsIo = io;

  io.on("connection", async (socket: Socket) => {
    const user = socket.user;
    if (!user) {
      return;
    }

    socket.join(getRoom(user.userId));

    try {
      const unreadCount = await notificationsRepository.countUnreadForRecipient(user.userId);
      emitToUser(user.userId, "notification.count", { unreadCount });
    } catch {
      // ignore count bootstrap failures
    }
  });
}

export function emitNotificationCreated(userId: string, notification: unknown) {
  emitToUser(userId, "notification.created", notification);
}

export function emitNotificationRead(userId: string, payload: unknown) {
  emitToUser(userId, "notification.read", payload);
}

export function emitNotificationDeleted(userId: string, payload: unknown) {
  emitToUser(userId, "notification.deleted", payload);
}

export function emitNotificationCount(userId: string, unreadCount: number) {
  emitToUser(userId, "notification.count", { unreadCount });
}
