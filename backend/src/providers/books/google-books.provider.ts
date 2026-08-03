import axios from "axios";
import type { BookProvider, NormalizedBook } from "./book-provider.interface.js";
import { env } from "../../config/env.js";

const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    publisher?: string;
    publishedDate?: string;
    language?: string;
    pageCount?: number;
    imageLinks?: { thumbnail?: string };
    averageRating?: number;
    ratingsCount?: number;
    previewLink?: string;
    infoLink?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

function normalizeVolume(volume: GoogleBooksVolume): NormalizedBook {
  const info = volume.volumeInfo;
  const isbn10 = info.industryIdentifiers?.find((id) => id.type === "ISBN_10")?.identifier;
  const isbn13 = info.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier;

  return {
    googleBooksId: volume.id,
    isbn10,
    isbn13,
    title: info.title,
    subtitle: info.subtitle,
    authors: info.authors ?? [],
    description: info.description,
    categories: info.categories ?? [],
    publisher: info.publisher,
    publishedDate: info.publishedDate,
    language: info.language,
    pageCount: info.pageCount,
    thumbnail: info.imageLinks?.thumbnail,
    averageRating: info.averageRating,
    ratingsCount: info.ratingsCount,
    previewLink: info.previewLink,
    infoLink: info.infoLink,
    sourceProvider: "google_books",
  };
}

export const googleBooksProvider: BookProvider = {
  search: async (query: string, maxResults = 10): Promise<NormalizedBook[]> => {
    const response = await axios.get<{ items?: GoogleBooksVolume[] }>(GOOGLE_BOOKS_BASE_URL, {
      params: { q: query, maxResults, key: env.GOOGLE_BOOKS_API_KEY },
    });

    return (response.data.items ?? []).map(normalizeVolume);
  },

  findByIsbn: async (isbn: string): Promise<NormalizedBook | null> => {
    const response = await axios.get<{ items?: GoogleBooksVolume[] }>(GOOGLE_BOOKS_BASE_URL, {
      params: { q: `isbn:${isbn}`, key: env.GOOGLE_BOOKS_API_KEY },
    });

    const first = response.data.items?.[0];
    return first ? normalizeVolume(first) : null;
  },
};
