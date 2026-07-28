import { apiClient } from "../../../lib/apiClient";
import type { AuthResponse, RegisterPayload, LoginPayload } from "../types/auth.types";

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
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
};
