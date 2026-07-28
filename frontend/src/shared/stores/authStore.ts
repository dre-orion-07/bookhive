import { create } from "zustand";

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
  clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),
}));
