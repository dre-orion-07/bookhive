import { bookshelvesRepository } from "./bookshelves.repository.js";
import { booksRepository } from "../books/books.repository.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";

export const bookshelvesService = {
  create: async (userId: string, name: string, icon?: string) => {
    return bookshelvesRepository.create(userId, name, icon);
  },

  list: async (userId: string) => {
    return bookshelvesRepository.listByUser(userId);
  },

  delete: async (userId: string, shelfId: string) => {
    const shelf = await bookshelvesRepository.findById(shelfId);
    if (!shelf) {
      throw ErrorFactory.bookshelfNotFound();
    }
    if (shelf.userId !== userId) {
      throw ErrorFactory.accessDenied("You can only delete your own bookshelves.");
    }
    return bookshelvesRepository.delete(shelfId);
  },

  addBook: async (userId: string, shelfId: string, bookId: string) => {
    const shelf = await bookshelvesRepository.findById(shelfId);
    if (!shelf) {
      throw ErrorFactory.bookshelfNotFound();
    }
    if (shelf.userId !== userId) {
      throw ErrorFactory.accessDenied("You can only modify your own bookshelves.");
    }

    const book = await booksRepository.findById(bookId);
    if (!book) {
      throw ErrorFactory.bookshelfNotFound();
    }

    if (shelf.bookIds.includes(bookId)) {
      throw ErrorFactory.validation("This book is already on this shelf.");
    }

    const updatedBookIds = [...shelf.bookIds, bookId];
    return bookshelvesRepository.addBook(shelfId, updatedBookIds);
  },

  removeBook: async (userId: string, shelfId: string, bookId: string) => {
    const shelf = await bookshelvesRepository.findById(shelfId);
    if (!shelf) {
      throw ErrorFactory.userNotFound();
    }
    if (shelf.userId !== userId) {
      throw ErrorFactory.accessDenied("You can only modify your own bookshelves.");
    }

    const updatedBookIds = shelf.bookIds.filter((id) => id !== bookId);
    return bookshelvesRepository.addBook(shelfId, updatedBookIds);
  },
};
