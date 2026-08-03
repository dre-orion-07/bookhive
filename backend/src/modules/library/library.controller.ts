import type { Response, NextFunction } from "express";
import { libraryService } from "./library.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import type { AddToLibraryInput } from "./library.schema.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";

export const libraryController = {
  addBook: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { bookId } = req.body as AddToLibraryInput;
      const entry = await libraryService.addBook(req.user!.userId, bookId);
      return sendSuccess(res, entry, "Book added to library.", 201);
    } catch (err) {
      return next(err);
    }
  },

  removeBook: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { bookId } = req.params;
      if (typeof bookId !== "string") {
        throw new Error("Invalid book ID.");
      }
      await libraryService.removeBook(req.user!.userId, bookId);
      return sendSuccess(res, null, "Book removed from library.");
    } catch (err) {
      return next(err);
    }
  },

  getLibrary: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const library = await libraryService.getUserLibrary(req.user!.userId);
      return sendSuccess(res, library, "Library retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },
};
