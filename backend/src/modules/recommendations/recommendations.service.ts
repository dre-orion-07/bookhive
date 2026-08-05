import { rankRecommendations } from "./engines/ranking.engine.js";
import { recommendationsRepository } from "./recommendations.repository.js";
import { booksRepository } from "../books/books.repository.js";
import { grokProvider } from "../../providers/ai/grok.provider.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const recommendationsService = {
  generateForUser: async (userId: string, limit = 10) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const ranked = await rankRecommendations(userId, limit);

    const userContext = user
      ? `Enjoys genres: ${user.favouriteGenres.join(", ") || "unspecified"}. Favourite authors: ${user.favouriteAuthors.join(", ") || "unspecified"}.`
      : "No preferences specified yet.";

    const withReasons = await Promise.all(
      ranked.map(async (item) => {
        const book = await booksRepository.findById(item.bookId);
        let reason = item.reason ?? "Recommended for you.";

        if (book && item.sources.includes("content_based")) {
          reason = await grokProvider.generateRecommendationReasoning(userContext, book.title);
        }

        return {
          userId,
          bookId: item.bookId,
          reason,
          confidenceScore: Math.min(item.score / 50, 1),
          generatedBy: item.sources.join("+"),
        };
      })
    );

    await recommendationsRepository.clearForUser(userId);
    await recommendationsRepository.saveMany(withReasons);

    return recommendationsRepository.listByUser(userId);
  },

  getForUser: async (userId: string) => {
    const existing = await recommendationsRepository.listByUser(userId);
    if (existing.length > 0) {
      return existing;
    }
    return recommendationsService.generateForUser(userId);
  },
};
