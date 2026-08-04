export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  title: string | null;
  content: string;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  bookId: string;
  rating: number;
  title?: string;
  content: string;
}
