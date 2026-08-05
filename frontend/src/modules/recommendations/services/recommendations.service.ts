import { apiClient } from "../../../lib/apiClient";
import type { Recommendation } from "../types/recommendation.types";

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export const recommendationsService = {
  get: async (): Promise<Recommendation[]> => {
    const response = await apiClient.get<ApiSuccessResponse<Recommendation[]>>("/recommendations");
    return response.data.data;
  },

  refresh: async (): Promise<Recommendation[]> => {
    const response = await apiClient.post<ApiSuccessResponse<Recommendation[]>>(
      "/recommendations/refresh"
    );
    return response.data.data;
  },
};
