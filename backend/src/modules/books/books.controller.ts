import type { Request, Response, NextFunction } from "express";
import { booksService } from "./books.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";

export const booksController = {
  search: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q;
      if (!query || typeof query !== "string") {
        throw ErrorFactory.validation("A search query is required (?q=...).");
      }
      const results = await booksService.search(query);
      return sendSuccess(res, results, "Books retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        throw ErrorFactory.validation("A valid book ID is required.");
      }
      const book = await booksService.getById(id);
      return sendSuccess(res, book, "Book retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },
};
