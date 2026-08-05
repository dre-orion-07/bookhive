export interface AIProvider {
  generateRecommendationReasoning: (userContext: string, bookTitle: string) => Promise<string>;
}
