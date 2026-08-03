import { PrismaClient } from "@prisma/client";
import type { NormalizedBook } from "../../providers/books/book-provider.interface.js";

const prisma = new PrismaClient();

export const booksRepository = {
  findById: (id: string) => {
    return prisma.book.findUnique({ where: { id } });
  },

  findByGoogleBooksId: (googleBooksId: string) => {
    return prisma.book.findFirst({ where: { googleBooksId } });
  },

  searchLocal: (query: string, limit: number) => {
    return prisma.book.findMany({
      where: {
        OR: [{ title: { contains: query, mode: "insensitive" } }, { authors: { has: query } }],
      },
      take: limit,
    });
  },

  create: (data: NormalizedBook) => {
    return prisma.book.create({ data });
  },
};
