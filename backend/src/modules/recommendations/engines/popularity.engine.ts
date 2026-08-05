import { PrismaClient } from "@prisma/client";
import type { ScoredBook } from "./content-based.engine.js";

const prisma = new PrismaClient();

export async function getPopularityRecommendations(
  userId: string,
  limit = 10
): Promise<ScoredBook[]> {
  const alreadyInLibrary = await prisma.library.findMany({
    where: { userId },
    select: { bookId: true },
  });
  const excludeIds = alreadyInLibrary.map((entry) => entry.bookId);

  const candidates = await prisma.book.findMany({
    where: {
      id: { notIn: excludeIds },
      communityRatingsCount: { gt: 0 },
    },
    orderBy: [{ communityAverageRating: "desc" }, { communityRatingsCount: "desc" }],
    take: limit,
  });

  return candidates.map((book, index) => ({
    bookId: book.id,
    score: (limit - index) * 5,
    reason: "Highly rated by the BookHive community",
  }));
}
