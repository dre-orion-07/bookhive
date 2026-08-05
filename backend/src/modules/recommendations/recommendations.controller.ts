import type { Response, NextFunction } from "express";
import { recommendationsService } from "./recommendations.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";

export const recommendationsController = {
  get: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const recommendations = await recommendationsService.getForUser(req.user!.userId);
      return sendSuccess(res, recommendations, "Recommendations retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  refresh: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const recommendations = await recommendationsService.generateForUser(req.user!.userId);
      return sendSuccess(res, recommendations, "Recommendations refreshed successfully.");
    } catch (err) {
      return next(err);
    }
  },
};
