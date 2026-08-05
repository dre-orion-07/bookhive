import { PrismaClient } from "@prisma/client";
import type { ScoredBook } from "./content-based.engine.js";

const prisma = new PrismaClient();

export async function getFreshnessRecommendations(
  userId: string,
  limit = 10
): Promise<ScoredBook[]> {
  const alreadyInLibrary = await prisma.library.findMany({
    where: { userId },
    select: { bookId: true },
  });
  const excludeIds = alreadyInLibrary.map((entry) => entry.bookId);

  const candidates = await prisma.book.findMany({
    where: { id: { notIn: excludeIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return candidates.map((book, index) => ({
    bookId: book.id,
    score: (limit - index) * 3,
    reason: "Recently added to BookHive",
  }));
}
