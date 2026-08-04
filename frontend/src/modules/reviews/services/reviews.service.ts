import { apiClient } from "../../../lib/apiClient";
import type { Review, CreateReviewPayload } from "../types/review.types";

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export const reviewsService = {
  listForBook: async (bookId: string): Promise<Review[]> => {
    const response = await apiClient.get<ApiSuccessResponse<Review[]>>(`/reviews/book/${bookId}`);
    return response.data.data;
  },

  create: async (payload: CreateReviewPayload): Promise<Review> => {
    const response = await apiClient.post<ApiSuccessResponse<Review>>("/reviews", payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },

  toggleLike: async (id: string): Promise<Review> => {
    const response = await apiClient.post<ApiSuccessResponse<Review>>(`/reviews/${id}/like`);
    return response.data.data;
  },
};
