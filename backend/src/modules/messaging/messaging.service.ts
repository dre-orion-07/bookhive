import repo from "./messaging.repository.js";
import { PrismaClient } from "@prisma/client";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";

const prisma = new PrismaClient();

export default {
  createConversation: async (
    creatorId: string,
    payload: {
      title?: string;
      type: "PRIVATE" | "GROUP" | "CLUB";
      clubId?: string | null;
      participantIds: string[];
    }
  ) => {
    if (!payload.participantIds.includes(creatorId)) payload.participantIds.push(creatorId);

    if (payload.type === "CLUB") {
      if (!payload.clubId)
        throw ErrorFactory.validation("clubId is required for club conversations");
      // ensure creator is a club member
      const member = await prisma.clubMember.findFirst({
        where: { clubId: payload.clubId, userId: creatorId },
      });
      if (!member)
        throw ErrorFactory.accessDenied("You must be a club member to create club conversations.");
    }

    return repo.createConversation({
      title: payload.title,
      type: payload.type,
      clubId: payload.clubId ?? null,
      participantIds: payload.participantIds,
    });
  },

  getConversationsForUser: async (userId: string) => {
    return repo.getConversationsForUser(userId);
  },

  getConversationIfParticipant: async (conversationId: string, userId: string) => {
    const conv = await repo.getConversationById(conversationId);
    if (!conv) throw ErrorFactory.validation("Conversation not found.");
    if (!conv.participantIds.includes(userId))
      throw ErrorFactory.accessDenied("Access denied to this conversation.");
    return conv;
  },

  sendMessage: async (
    conversationId: string,
    senderId: string,
    content: string,
    attachments?: string[]
  ) => {
    const conv = await repo.getConversationById(conversationId);
    if (!conv) throw ErrorFactory.validation("Conversation not found.");
    if (!conv.participantIds.includes(senderId))
      throw ErrorFactory.accessDenied("You are not a member of this conversation.");

    const message = await repo.createMessage({ conversationId, senderId, content, attachments });
    return message;
  },

  getMessages: async (conversationId: string, userId: string, limit?: number, cursor?: string) => {
    const conv = await repo.getConversationById(conversationId);
    if (!conv) throw ErrorFactory.validation("Conversation not found.");
    if (!conv.participantIds.includes(userId))
      throw ErrorFactory.accessDenied("Access denied to this conversation.");
    return repo.getMessages(conversationId, limit, cursor);
  },

  markRead: async (messageId: string, userId: string) => {
    return repo.markMessageRead(messageId, userId);
  },
};
