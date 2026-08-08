import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../../shared/jwt/jwt.js";
import messagingService from "./messaging.service.js";

type PresenceMap = Map<string, Set<string>>;

type SocketUser = {
  userId: string;
  email: string;
};

declare module "socket.io" {
  interface Socket {
    user?: SocketUser;
  }
}

const presence: PresenceMap = new Map();

export function setupMessagingSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.use((socket, next): void => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error("Authentication token required"));
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      socket.user = payload;
      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error(String(err)));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.user;
    if (!user) {
      socket.disconnect();
      return;
    }

    // add to presence
    const sockets = presence.get(user.userId) ?? new Set<string>();
    sockets.add(socket.id);
    presence.set(user.userId, sockets);
    io.emit("presence.update", { userId: user.userId, online: true });

    socket.on("conversation.join", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation.leave", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on(
      "message.create",
      async (
        payload: {
          conversationId: string;
          content: string;
          attachments?: string[];
          clientId?: string;
        },
        cb?: (res: { success: boolean; data?: unknown; error?: string }) => void
      ) => {
        try {
          const msg = await messagingService.sendMessage(
            payload.conversationId,
            user.userId,
            payload.content,
            payload.attachments
          );
          // attach clientId for optimistic UI mapping
          const out = { ...msg, clientId: payload.clientId } as unknown;
          io.to(`conversation:${payload.conversationId}`).emit("message.created", out);
          if (cb) cb({ success: true, data: out });
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          if (cb) cb({ success: false, error: errorMsg });
        }
      }
    );

    socket.on("typing.start", (conversationId: string) => {
      socket
        .to(`conversation:${conversationId}`)
        .emit("typing", { userId: user.userId, typing: true });
    });

    socket.on("typing.stop", (conversationId: string) => {
      socket
        .to(`conversation:${conversationId}`)
        .emit("typing", { userId: user.userId, typing: false });
    });

    socket.on("message.read", async (payload: { messageId: string }) => {
      try {
        await messagingService.markRead(payload.messageId, user.userId);
        io.emit("message.read", { messageId: payload.messageId, userId: user.userId });
      } catch {
        // ignore
      }
    });

    socket.on("disconnect", () => {
      const s = presence.get(user.userId);
      if (s) {
        s.delete(socket.id);
        if (s.size === 0) {
          presence.delete(user.userId);
          io.emit("presence.update", { userId: user.userId, online: false });
        } else {
          presence.set(user.userId, s);
        }
      }
    });
  });

  return io;
}
