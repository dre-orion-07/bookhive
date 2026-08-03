import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const readingProgressRepository = {
  findEntry: (userId: string, bookId: string) => {
    return prisma.readingProgress.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
  },

  upsert: (
    userId: string,
    bookId: string,
    data: {
      status?: string;
      currentPage?: number;
      percentComplete?: number;
      notes?: string;
      startedAt?: Date;
      finishedAt?: Date;
    }
  ) => {
    return prisma.readingProgress.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId, ...data },
      update: data,
    });
  },

  listByUser: (userId: string, status?: string) => {
    return prisma.readingProgress.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: { updatedAt: "desc" },
    });
  },
};
