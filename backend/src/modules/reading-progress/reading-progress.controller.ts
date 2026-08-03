import type { Response, NextFunction } from "express";
import { readingProgressService } from "./reading-progress.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import type { UpdateProgressInput } from "./reading-progress.schema.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";

export const readingProgressController = {
  updateProgress: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { bookId } = req.params;
      if (typeof bookId !== "string") {
        throw new Error("Invalid book ID.");
      }
      const progress = await readingProgressService.updateProgress(
        req.user!.userId,
        bookId,
        req.body as UpdateProgressInput
      );
      return sendSuccess(res, progress, "Reading progress updated.");
    } catch (err) {
      return next(err);
    }
  },

  getProgress: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { bookId } = req.params;
      if (typeof bookId !== "string") {
        throw new Error("Invalid book ID.");
      }
      const progress = await readingProgressService.getProgress(req.user!.userId, bookId);
      return sendSuccess(res, progress, "Reading progress retrieved.");
    } catch (err) {
      return next(err);
    }
  },

  getHistory: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const status = typeof req.query.status === "string" ? req.query.status : undefined;
      const history = await readingProgressService.getReadingHistory(req.user!.userId, status);
      return sendSuccess(res, history, "Reading history retrieved.");
    } catch (err) {
      return next(err);
    }
  },
};
