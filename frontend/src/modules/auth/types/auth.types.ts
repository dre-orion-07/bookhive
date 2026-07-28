export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
