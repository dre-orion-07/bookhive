import { authRepository } from "./auth.repository.js";
import { hashPassword, comparePassword } from "../../shared/hashing/password.js";
import { signAccessToken, signRefreshToken } from "../../shared/jwt/jwt.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";

export const authService = {
  register: async (input: RegisterInput) => {
    const existingEmail = await authRepository.findByEmail(input.email);
    if (existingEmail) {
      throw ErrorFactory.emailAlreadyExists();
    }

    const existingUsername = await authRepository.findByUsername(input.username);
    if (existingUsername) {
      throw ErrorFactory.usernameAlreadyExists();
    }

    const passwordHash = await hashPassword(input.password);

    const user = await authRepository.create({
      email: input.email,
      passwordHash,
      username: input.username,
      displayName: input.displayName,
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
      accessToken,
      refreshToken,
    };
  },

  login: async (input: LoginInput) => {
    const user = await authRepository.findByEmail(input.email);

    if (!user || !user.passwordHash) {
      throw ErrorFactory.authenticationFailed();
    }

    const isValidPassword = await comparePassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw ErrorFactory.authenticationFailed();
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
      accessToken,
      refreshToken,
    };
  },
  getCurrentUser: async (userId: string) => {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw ErrorFactory.userNotFound();
    }
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
    };
  },
};
