import { apiClient } from "../../../lib/apiClient";
import type { FollowUser, DiscoveredReader } from "../types/follow.types";

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export const followsService = {
  follow: async (userId: string): Promise<void> => {
    await apiClient.post(`/follow/${userId}`);
  },

  unfollow: async (userId: string): Promise<void> => {
    await apiClient.delete(`/follow/${userId}`);
  },

  getFollowers: async (): Promise<FollowUser[]> => {
    const response = await apiClient.get<ApiSuccessResponse<FollowUser[]>>("/follow/followers");
    return response.data.data;
  },

  getFollowing: async (): Promise<FollowUser[]> => {
    const response = await apiClient.get<ApiSuccessResponse<FollowUser[]>>("/follow/following");
    return response.data.data;
  },

  discoverReaders: async (): Promise<DiscoveredReader[]> => {
    const response =
      await apiClient.get<ApiSuccessResponse<DiscoveredReader[]>>("/follow/discover");
    return response.data.data;
  },
};
