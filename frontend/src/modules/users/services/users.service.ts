import { apiClient } from "../../../lib/apiClient";
import type {
  UserProfile,
  UpdateProfilePayload,
  ReadingStats,
  PublicProfile,
} from "../types/user.types";

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export const usersService = {
  getById: async (id: string): Promise<UserProfile> => {
    const response = await apiClient.get<ApiSuccessResponse<UserProfile>>(`/users/${id}`);
    return response.data.data;
  },

  getByUsername: async (username: string): Promise<UserProfile> => {
    const response = await apiClient.get<ApiSuccessResponse<UserProfile>>(
      `/users/username/${username}`
    );
    return response.data.data;
  },

  getPublicProfile: async (username: string): Promise<PublicProfile> => {
    const response = await apiClient.get<ApiSuccessResponse<PublicProfile>>(
      `/users/profile/${username}`
    );
    return response.data.data;
  },

  getMyStats: async (): Promise<ReadingStats> => {
    const response = await apiClient.get<ApiSuccessResponse<ReadingStats>>("/users/me/stats");
    return response.data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const response = await apiClient.patch<ApiSuccessResponse<UserProfile>>(
      "/users/profile",
      payload
    );
    return response.data.data;
  },

  uploadAvatar: async (file: File): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await apiClient.post<ApiSuccessResponse<UserProfile>>(
      "/users/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },
};
