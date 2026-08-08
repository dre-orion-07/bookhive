import { authRepository } from "./auth.repository.js";
import { hashPassword, comparePassword } from "../../shared/hashing/password.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../shared/jwt/jwt.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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
      isNewUser: true,
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

  googleAuth: async (idToken: string) => {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw ErrorFactory.authenticationFailed("Invalid Google token.");
    }

    let user = await authRepository.findByGoogleId(payload.sub);

    if (!user) {
      const existingEmailUser = await authRepository.findByEmail(payload.email);

      if (existingEmailUser) {
        throw ErrorFactory.emailAlreadyExists(
          "An account with this email already exists. Please log in with your password instead."
        );
      }

      const baseUsername = payload.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
      const username = `${baseUsername}${Math.floor(Math.random() * 10000)}`;

      user = await authRepository.createFromGoogle({
        email: payload.email,
        googleId: payload.sub,
        username,
        displayName: payload.name || payload.email.split("@")[0],
        avatar: payload.picture,
      });
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

  refreshAccessToken: async (refreshToken: string) => {
    const payload = verifyRefreshToken(refreshToken);

    const user = await authRepository.findById(payload.userId);
    if (!user) {
      throw ErrorFactory.userNotFound();
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = signRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  },
};
