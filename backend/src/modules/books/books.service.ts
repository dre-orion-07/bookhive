import { booksRepository } from "./books.repository.js";
import { googleBooksProvider } from "../../providers/books/google-books.provider.js";
import { openLibraryProvider } from "../../providers/books/open-library.provider.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import type { NormalizedBook } from "../../providers/books/book-provider.interface.js";

async function importBook(normalized: NormalizedBook) {
  if (normalized.googleBooksId) {
    const existing = await booksRepository.findByGoogleBooksId(normalized.googleBooksId);
    if (existing) return existing;
  }
  return booksRepository.create(normalized);
}

export const booksService = {
  search: async (query: string, limit = 10) => {
    const localResults = await booksRepository.searchLocal(query, limit);

    if (localResults.length > 0) {
      return localResults;
    }

    const googleResults = await googleBooksProvider.search(query, limit);
    if (googleResults.length > 0) {
      const imported = await Promise.all(googleResults.map(importBook));
      return imported;
    }

    const openLibraryResults = await openLibraryProvider.search(query, limit);
    if (openLibraryResults.length > 0) {
      const imported = await Promise.all(openLibraryResults.map(importBook));
      return imported;
    }

    return [];
  },

  getById: async (id: string) => {
    const book = await booksRepository.findById(id);
    if (!book) {
      throw ErrorFactory.bookNotFound();
    }
    return book;
  },
};
