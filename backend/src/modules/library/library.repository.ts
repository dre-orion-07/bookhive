import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const libraryRepository = {
  findEntry: (userId: string, bookId: string) => {
    return prisma.library.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
  },

  add: (userId: string, bookId: string) => {
    return prisma.library.create({ data: { userId, bookId } });
  },

  remove: (userId: string, bookId: string) => {
    return prisma.library.delete({
      where: { userId_bookId: { userId, bookId } },
    });
  },

  listByUser: (userId: string) => {
    return prisma.library.findMany({
      where: { userId },
      orderBy: { addedAt: "desc" },
    });
  },
};
