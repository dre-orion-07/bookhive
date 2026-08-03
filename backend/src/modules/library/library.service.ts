import { libraryRepository } from "./library.repository.js";
import { booksRepository } from "../books/books.repository.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";

export const libraryService = {
  addBook: async (userId: string, bookId: string) => {
    const book = await booksRepository.findById(bookId);
    if (!book) {
      throw ErrorFactory.bookNotFound();
    }

    const existing = await libraryRepository.findEntry(userId, bookId);
    if (existing) {
      throw ErrorFactory.validation("This book is already in your library.");
    }

    return libraryRepository.add(userId, bookId);
  },

  removeBook: async (userId: string, bookId: string) => {
    const existing = await libraryRepository.findEntry(userId, bookId);
    if (!existing) {
      throw ErrorFactory.bookNotFound();
    }

    return libraryRepository.remove(userId, bookId);
  },

  getUserLibrary: async (userId: string) => {
    const entries = await libraryRepository.listByUser(userId);

    const books = await Promise.all(
      entries.map(async (entry) => {
        const book = await booksRepository.findById(entry.bookId);
        return { ...entry, book };
      })
    );

    return books.filter((entry) => entry.book !== null);
  },
};
