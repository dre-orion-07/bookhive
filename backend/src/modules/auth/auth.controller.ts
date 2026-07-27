import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body as RegisterInput);
      return sendSuccess(res, result, "Account created successfully.", 201);
    } catch (err) {
      next(err);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body as LoginInput);
      return sendSuccess(res, result, "Logged in successfully.");
    } catch (err) {
      next(err);
    }
  },
};
