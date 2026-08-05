import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const recommendationsRepository = {
  saveMany: (
    entries: {
      userId: string;
      bookId: string;
      reason?: string;
      confidenceScore: number;
      generatedBy: string;
    }[]
  ) => {
    return prisma.recommendation.createMany({ data: entries });
  },

  listByUser: (userId: string) => {
    return prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  clearForUser: (userId: string) => {
    return prisma.recommendation.deleteMany({ where: { userId } });
  },
};
