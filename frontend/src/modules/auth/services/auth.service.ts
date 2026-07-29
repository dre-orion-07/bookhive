import { apiClient } from "../../../lib/apiClient";
import type { AuthResponse, RegisterPayload, LoginPayload, User } from "../types/auth.types";

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      "/auth/register",
      payload
    );
    return response.data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>("/auth/login", payload);
    return response.data.data;
  },

  googleAuth: async (idToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>("/auth/google", {
      idToken,
    });
    return response.data.data;
  },

  refreshSession: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<ApiSuccessResponse<RefreshTokenResponse>>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiSuccessResponse<User>>("/auth/me");
    return response.data.data;
  },
};
