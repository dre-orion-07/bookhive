import type { Response, NextFunction } from "express";
import { followsService } from "./follows.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";

export const followsController = {
  follow: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      if (typeof userId !== "string") throw new Error("Invalid user ID.");
      const relation = await followsService.follow(req.user!.userId, userId);
      return sendSuccess(res, relation, "Now following user.", 201);
    } catch (err) {
      return next(err);
    }
  },

  discoverReaders: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const readers = await followsService.discoverReaders(req.user!.userId);
      return sendSuccess(res, readers, "Readers discovered successfully.");
    } catch (err) {
      return next(err);
    }
  },

  unfollow: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      if (typeof userId !== "string") throw new Error("Invalid user ID.");
      await followsService.unfollow(req.user!.userId, userId);
      return sendSuccess(res, null, "Unfollowed user.");
    } catch (err) {
      return next(err);
    }
  },

  getFollowers: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const followers = await followsService.getFollowers(req.user!.userId);
      return sendSuccess(res, followers, "Followers retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  getFollowing: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const following = await followsService.getFollowing(req.user!.userId);
      return sendSuccess(res, following, "Following retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },
};
