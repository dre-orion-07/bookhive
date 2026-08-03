import type { Response, NextFunction } from "express";
import { bookshelvesService } from "./bookshelves.service.js";
import { sendSuccess } from "../../shared/responses/ApiResponse.js";
import type { CreateBookshelfInput, AddBookToShelfInput } from "./bookshelves.schema.js";
import type { AuthenticatedRequest } from "../../shared/middleware/authenticate.js";

export const bookshelvesController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { name, icon } = req.body as CreateBookshelfInput;
      const shelf = await bookshelvesService.create(req.user!.userId, name, icon);
      return sendSuccess(res, shelf, "Bookshelf created successfully.", 201);
    } catch (err) {
      return next(err);
    }
  },

  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const shelves = await bookshelvesService.list(req.user!.userId);
      return sendSuccess(res, shelves, "Bookshelves retrieved successfully.");
    } catch (err) {
      return next(err);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") throw new Error("Invalid shelf ID.");
      await bookshelvesService.delete(req.user!.userId, id);
      return sendSuccess(res, null, "Bookshelf deleted successfully.");
    } catch (err) {
      return next(err);
    }
  },

  addBook: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") throw new Error("Invalid shelf ID.");
      const { bookId } = req.body as AddBookToShelfInput;
      const shelf = await bookshelvesService.addBook(req.user!.userId, id, bookId);
      return sendSuccess(res, shelf, "Book added to shelf.");
    } catch (err) {
      return next(err);
    }
  },

  removeBook: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id, bookId } = req.params;
      if (typeof id !== "string" || typeof bookId !== "string") {
        throw new Error("Invalid parameters.");
      }
      const shelf = await bookshelvesService.removeBook(req.user!.userId, id, bookId);
      return sendSuccess(res, shelf, "Book removed from shelf.");
    } catch (err) {
      return next(err);
    }
  },
};
