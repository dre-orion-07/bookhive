import axios from "axios";
import type { BookProvider, NormalizedBook } from "./book-provider.interface.js";

const OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json";

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  publisher?: string[];
  language?: string[];
  number_of_pages_median?: number;
  cover_i?: number;
  subject?: string[];
}

function normalizeDoc(doc: OpenLibraryDoc): NormalizedBook {
  return {
    openLibraryId: doc.key,
    isbn10: doc.isbn?.find((code) => code.length === 10),
    isbn13: doc.isbn?.find((code) => code.length === 13),
    title: doc.title,
    authors: doc.author_name ?? [],
    categories: doc.subject?.slice(0, 5) ?? [],
    publisher: doc.publisher?.[0],
    publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
    language: doc.language?.[0],
    pageCount: doc.number_of_pages_median,
    thumbnail: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : undefined,
    infoLink: `https://openlibrary.org${doc.key}`,
    sourceProvider: "open_library",
  };
}

export const openLibraryProvider: BookProvider = {
  search: async (query: string, maxResults = 10): Promise<NormalizedBook[]> => {
    const response = await axios.get<{ docs: OpenLibraryDoc[] }>(OPEN_LIBRARY_SEARCH_URL, {
      params: { q: query, limit: maxResults },
    });

    return response.data.docs.map(normalizeDoc);
  },

  findByIsbn: async (isbn: string): Promise<NormalizedBook | null> => {
    const response = await axios.get<{ docs: OpenLibraryDoc[] }>(OPEN_LIBRARY_SEARCH_URL, {
      params: { q: `isbn:${isbn}`, limit: 1 },
    });

    const first = response.data.docs[0];
    return first ? normalizeDoc(first) : null;
  },
};
