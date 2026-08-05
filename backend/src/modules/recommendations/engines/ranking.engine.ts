import { getContentBasedRecommendations } from "./content-based.engine.js";
import { getPopularityRecommendations } from "./popularity.engine.js";
import { getFreshnessRecommendations } from "./freshness.engine.js";
import type { ScoredBook } from "./content-based.engine.js";

export interface RankedBook extends ScoredBook {
  sources: string[];
}

export async function rankRecommendations(userId: string, limit = 10): Promise<RankedBook[]> {
  const [contentBased, popularity, freshness] = await Promise.all([
    getContentBasedRecommendations(userId, limit),
    getPopularityRecommendations(userId, limit),
    getFreshnessRecommendations(userId, limit),
  ]);

  const merged = new Map<string, RankedBook>();

  const mergeIn = (results: ScoredBook[], sourceName: string) => {
    for (const result of results) {
      const existing = merged.get(result.bookId);
      if (existing) {
        existing.score += result.score;
        existing.sources.push(sourceName);
      } else {
        merged.set(result.bookId, {
          ...result,
          sources: [sourceName],
        });
      }
    }
  };

  mergeIn(contentBased, "content_based");
  mergeIn(popularity, "popularity");
  mergeIn(freshness, "freshness");

  return Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
