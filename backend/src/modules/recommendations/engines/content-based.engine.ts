import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ScoredBook {
  bookId: string;
  score: number;
  reason?: string;
}

export async function getContentBasedRecommendations(
  userId: string,
  limit = 10
): Promise<ScoredBook[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.favouriteGenres.length === 0) {
    return [];
  }

  const alreadyInLibrary = await prisma.library.findMany({
    where: { userId },
    select: { bookId: true },
  });
  const excludeIds = alreadyInLibrary.map((entry) => entry.bookId);

  const candidates = await prisma.book.findMany({
    where: { id: { notIn: excludeIds } },
    take: 200,
  });

  const genresLower = user.favouriteGenres.map((g) => g.toLowerCase());
  const authorsLower = user.favouriteAuthors.map((a) => a.toLowerCase());

  const scored: ScoredBook[] = [];

  for (const book of candidates) {
    const matchedCategory = book.categories.find((category) => {
      const categoryLower = category.toLowerCase();
      return genresLower.some((genre) => {
        if (categoryLower === genre) return true;
        if (categoryLower.includes(genre) && genre.length >= 5) return true;
        return false;
      });
    });

    const authorMatch = book.authors.some((author) =>
      authorsLower.some((fav) => author.toLowerCase().includes(fav))
    );

    if (matchedCategory || authorMatch) {
      scored.push({
        bookId: book.id,
        score: (matchedCategory ? 10 : 0) + (authorMatch ? 15 : 0),
        reason: matchedCategory
          ? `Matches your interest in ${matchedCategory}`
          : "By an author you follow",
      });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
