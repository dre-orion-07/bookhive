import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const followsRepository = {
  findRelation: (followerId: string, followingId: string) => {
    return prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
  },

  create: (followerId: string, followingId: string) => {
    return prisma.follow.create({ data: { followerId, followingId } });
  },

  delete: (followerId: string, followingId: string) => {
    return prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  },

  listFollowers: (userId: string) => {
    return prisma.follow.findMany({ where: { followingId: userId } });
  },

  listFollowing: (userId: string) => {
    return prisma.follow.findMany({ where: { followerId: userId } });
  },

  countFollowers: (userId: string) => {
    return prisma.follow.count({ where: { followingId: userId } });
  },

  countFollowing: (userId: string) => {
    return prisma.follow.count({ where: { followerId: userId } });
  },
};
