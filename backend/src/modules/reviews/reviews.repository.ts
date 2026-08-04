import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const reviewsRepository = {
  findById: (id: string) => {
    return prisma.review.findUnique({ where: { id } });
  },

  findByUserAndBook: (userId: string, bookId: string) => {
    return prisma.review.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
  },

  listByBook: (bookId: string) => {
    return prisma.review.findMany({
      where: { bookId },
      orderBy: { createdAt: "desc" },
    });
  },

  listByUser: (userId: string) => {
    return prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  create: (data: {
    userId: string;
    bookId: string;
    rating: number;
    title?: string;
    content: string;
  }) => {
    return prisma.review.create({ data });
  },

  update: (id: string, data: { rating?: number; title?: string; content?: string }) => {
    return prisma.review.update({ where: { id }, data });
  },

  delete: (id: string) => {
    return prisma.review.delete({ where: { id } });
  },

  toggleLike: (id: string, likedBy: string[]) => {
    return prisma.review.update({ where: { id }, data: { likedBy } });
  },

  getBookRatingStats: async (bookId: string) => {
    const reviews = await prisma.review.findMany({
      where: { bookId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return { average: null, count: 0 };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return { average: sum / reviews.length, count: reviews.length };
  },
};
