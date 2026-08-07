import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const clubsRepository = {
  findById: (id: string) => {
    return prisma.bookClub.findUnique({ where: { id } });
  },

  create: (ownerId: string, data: { name: string; description?: string; visibility: string }) => {
    return prisma.bookClub.create({ data: { ...data, ownerId } });
  },

  update: (id: string, data: { name?: string; description?: string; visibility?: string }) => {
    return prisma.bookClub.update({ where: { id }, data });
  },

  delete: (id: string) => {
    return prisma.$transaction(async (tx) => {
      await tx.clubEvent.deleteMany({ where: { clubId: id } });
      await tx.clubMember.deleteMany({ where: { clubId: id } });
      return tx.bookClub.delete({ where: { id } });
    });
  },

  listPublic: () => {
    return prisma.bookClub.findMany({
      where: { visibility: "public" },
      orderBy: { createdAt: "desc" },
    });
  },

  findMembership: (clubId: string, userId: string) => {
    return prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });
  },

  addMember: (clubId: string, userId: string, role: string) => {
    return prisma.clubMember.create({ data: { clubId, userId, role } });
  },

  removeMember: (clubId: string, userId: string) => {
    return prisma.clubMember.delete({
      where: { clubId_userId: { clubId, userId } },
    });
  },

  listMembers: (clubId: string) => {
    return prisma.clubMember.findMany({ where: { clubId } });
  },

  countMembers: (clubId: string) => {
    return prisma.clubMember.count({ where: { clubId } });
  },

  createEvent: (
    clubId: string,
    data: { title: string; description?: string; startTime: Date; endTime?: Date }
  ) => {
    return prisma.clubEvent.create({ data: { ...data, clubId } });
  },

  listUpcomingEvents: (clubId: string) => {
    return prisma.clubEvent.findMany({
      where: { clubId, startTime: { gte: new Date() } },
      orderBy: { startTime: "asc" },
    });
  },

  /* Discussions */
  findDiscussions: (clubId: string, page = 1, limit = 20) => {
    const take = limit;
    const skip = (page - 1) * limit;
    return prisma.clubDiscussion.findMany({
      where: { clubId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },

  findDiscussionById: (id: string) => {
    return prisma.clubDiscussion.findUnique({ where: { id } });
  },

  createDiscussion: (
    clubId: string,
    data: { authorId: string; title: string; content: string }
  ) => {
    return prisma.clubDiscussion.create({ data: { ...data, clubId } });
  },

  updateDiscussion: (id: string, data: { title?: string; content?: string }) => {
    return prisma.clubDiscussion.update({ where: { id }, data });
  },

  deleteDiscussion: (id: string) => {
    return prisma.$transaction(async (tx) => {
      await tx.clubComment.deleteMany({ where: { discussionId: id } });
      return tx.clubDiscussion.delete({ where: { id } });
    });
  },

  /* Comments */
  listComments: (discussionId: string, page = 1, limit = 20) => {
    const take = limit;
    const skip = (page - 1) * limit;
    return prisma.clubComment.findMany({
      where: { discussionId },
      orderBy: { createdAt: "asc" },
      skip,
      take,
    });
  },

  createComment: (discussionId: string, data: { authorId: string; content: string }) => {
    return prisma.clubComment.create({ data: { ...data, discussionId } });
  },

  findCommentById: (id: string) => {
    return prisma.clubComment.findUnique({ where: { id } });
  },

  updateComment: (id: string, data: { content?: string }) => {
    return prisma.clubComment.update({ where: { id }, data });
  },

  deleteComment: (id: string) => {
    return prisma.clubComment.delete({ where: { id } });
  },

  /* Member management */
  updateMemberRole: (clubId: string, userId: string, role: string) => {
    return prisma.clubMember.update({
      where: { clubId_userId: { clubId, userId } },
      data: { role },
    });
  },

  setOwner: (clubId: string, newOwnerId: string) => {
    return prisma.bookClub.update({ where: { id: clubId }, data: { ownerId: newOwnerId } });
  },
};
