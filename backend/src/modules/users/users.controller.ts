import type { Response, NextFunction, Request } from "express";
import { usersService } from "./users.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import type { UpdateProfileInput } from "./users.schema.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";

export const usersController = {
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await usersService.getById(req.params.id as string);
      return sendSuccess(res, user, "User retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  uploadAvatar: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw ErrorFactory.validation("An image file is required.");
      }
      const user = await usersService.uploadAvatar(req.user!.userId, req.file.buffer);
      return sendSuccess(res, user, "Avatar uploaded successfully.");
    } catch (err) {
      return next(err);
    }
  },

  getByUsername: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await usersService.getByUsername(req.params.username as string);
      return sendSuccess(res, user, "User retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  getPublicProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const username = req.params.username as string;
      const viewerUserId = req.user?.userId;
      const profile = await usersService.getPublicProfile(username, viewerUserId);
      return sendSuccess(res, profile, "Public profile retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  getStats: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await usersService.getStats(req.user!.userId);
      return sendSuccess(res, stats, "Reading statistics retrieved successfully.");
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
