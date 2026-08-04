import type { Response, NextFunction } from "express";
import { reviewsService } from "./reviews.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import type { CreateReviewInput, UpdateReviewInput } from "./reviews.schema.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";

export const reviewsController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const review = await reviewsService.create(req.user!.userId, req.body as CreateReviewInput);
      return sendSuccess(res, review, "Review created successfully.", 201);
    } catch (err) {
      return next(err);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") throw new Error("Invalid review ID.");
      const review = await reviewsService.update(
        req.user!.userId,
        id,
        req.body as UpdateReviewInput
      );
      return sendSuccess(res, review, "Review updated successfully.");
    } catch (err) {
      return next(err);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") throw new Error("Invalid review ID.");
      await reviewsService.delete(req.user!.userId, id);
      return sendSuccess(res, null, "Review deleted successfully.");
    } catch (err) {
      return next(err);
    }
  },

  listForBook: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { bookId } = req.params;
      if (typeof bookId !== "string") throw new Error("Invalid book ID.");
      const reviews = await reviewsService.listForBook(bookId);
      return sendSuccess(res, reviews, "Reviews retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  listForUser: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      if (typeof userId !== "string") throw new Error("Invalid user ID.");
      const reviews = await reviewsService.listForUser(userId);
      return sendSuccess(res, reviews, "Reviews retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  toggleLike: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") throw new Error("Invalid review ID.");
      const review = await reviewsService.toggleLike(req.user!.userId, id);
      return sendSuccess(res, review, "Like toggled successfully.");
    } catch (err) {
      return next(err);
    }
  },
};
