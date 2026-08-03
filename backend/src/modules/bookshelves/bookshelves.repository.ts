import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const bookshelvesRepository = {
  findById: (id: string) => {
    return prisma.bookshelf.findUnique({ where: { id } });
  },

  listByUser: (userId: string) => {
    return prisma.bookshelf.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  },

  create: (userId: string, name: string, icon?: string) => {
    return prisma.bookshelf.create({
      data: { userId, name, icon, bookIds: [] },
    });
  },

  delete: (id: string) => {
    return prisma.bookshelf.delete({ where: { id } });
  },

  addBook: (id: string, bookIds: string[]) => {
    return prisma.bookshelf.update({
      where: { id },
      data: { bookIds },
    });
  },
};
