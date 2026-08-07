import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  createConversation: async (data: {
    title?: string;
    type: "PRIVATE" | "GROUP" | "CLUB";
    clubId?: string | null;
    participantIds: string[];
  }) => {
    return prisma.conversation.create({ data });
  },

  getConversationById: async (id: string) => {
    return prisma.conversation.findUnique({ where: { id } });
  },

  getConversationsForUser: async (userId: string, limit = 20) => {
    return prisma.conversation.findMany({
      where: { participantIds: { has: userId } },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
  },

  addParticipant: async (conversationId: string, userId: string, role = "member") => {
    const participant = await prisma.conversationParticipant.create({
      data: { conversationId, userId, role },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { participantIds: { push: userId } },
    });

    return participant;
  },

  createMessage: async (data: {
    conversationId: string;
    senderId: string;
    content: string;
    attachments?: string[];
  }) => {
    const msg = await prisma.message.create({
      data: { ...data, attachments: data.attachments ?? [] },
    });
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { lastMessageId: msg.id },
    });
    return msg;
  },

  getMessages: async (conversationId: string, limit = 50, cursor?: string) => {
    const args: Prisma.MessageFindManyArgs = {
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    };
    if (cursor) {
      args.skip = 1;
      args.cursor = { id: cursor };
    }
    const rows = await prisma.message.findMany(args);
    return rows.reverse();
  },

  markMessageRead: async (messageId: string, userId: string) => {
    return prisma.messageRead.upsert({
      where: { messageId_userId: { messageId, userId } },
      update: { readAt: new Date() },
      create: { messageId, userId, readAt: new Date() },
    });
  },
};
