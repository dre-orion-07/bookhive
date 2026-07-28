import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";
import type { RegisterInput, LoginInput, GoogleAuthInput } from "./auth.schema.js";

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body as RegisterInput);
      return sendSuccess(res, result, "Account created successfully.", 201);
    } catch (err) {
      return next(err);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body as LoginInput);
      return sendSuccess(res, result, "Logged in successfully.");
    } catch (err) {
      return next(err);
    }
  },

  me: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getCurrentUser(req.user!.userId);
      return sendSuccess(res, user, "Current user retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  googleAuth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body as GoogleAuthInput;
      const result = await authService.googleAuth(idToken);
      return sendSuccess(res, result, "Signed in with Google successfully.");
    } catch (err) {
      return next(err);
    }
  },
};
