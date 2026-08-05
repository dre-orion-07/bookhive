export interface Recommendation {
  id: string;
  userId: string;
  bookId: string;
  reason: string | null;
  confidenceScore: number;
  generatedBy: string;
  createdAt: string;
}
