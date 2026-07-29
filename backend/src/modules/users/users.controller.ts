import type { Response, NextFunction } from "express";
import { usersService } from "./users.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import type { UpdateProfileInput } from "./users.schema.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";

export const usersController = {
  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await usersService.getById(req.params.id as string);
      return sendSuccess(res, user, "User retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  getByUsername: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await usersService.getByUsername(req.params.username as string);
      return sendSuccess(res, user, "User retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  updateProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await usersService.updateProfile(
        req.user!.userId,
        req.body as UpdateProfileInput
      );
      return sendSuccess(res, user, "Profile updated successfully.");
    } catch (err) {
      return next(err);
    }
  },
};
