import type { Response, NextFunction } from "express";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";
import service from "./messaging.service.js";

function getConversationId(id: string | string[] | undefined) {
  if (typeof id !== "string") {
    throw ErrorFactory.validation("Conversation ID is required.");
  }

  return id;
}

const messagingController = {
  createConversation: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const payload = req.body;
      const conv = await service.createConversation(userId, payload);
      res.status(201).json({ success: true, data: conv });
    } catch (err) {
      next(err);
    }
  },

  listConversations: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const convs = await service.getConversationsForUser(userId);
      res.status(200).json({ success: true, data: convs });
    } catch (err) {
      next(err);
    }
  },

  getConversation: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const conversationId = getConversationId(req.params.id);
      const conv = await service.getConversationIfParticipant(conversationId, userId);
      res.status(200).json({ success: true, data: conv });
    } catch (err) {
      next(err);
    }
  },

  sendMessage: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { content, attachments } = req.body;
      const conversationId = getConversationId(req.params.id);
      const message = await service.sendMessage(conversationId, userId, content, attachments);
      res.status(201).json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  },

  getMessages: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { limit, cursor } = req.query;
      const conversationId = getConversationId(req.params.id);
      const parsedLimit =
        typeof limit === "string" && limit.trim() !== "" ? Number(limit) : undefined;
      const parsedCursor = typeof cursor === "string" ? cursor : undefined;
      const messages = await service.getMessages(conversationId, userId, parsedLimit, parsedCursor);
      res.status(200).json({ success: true, data: messages });
    } catch (err) {
      next(err);
    }
  },

  markRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { messageId } = req.body;
      const result = await service.markRead(messageId, userId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
};

export default messagingController;
