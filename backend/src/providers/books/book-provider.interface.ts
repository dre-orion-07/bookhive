export interface NormalizedBook {
  googleBooksId?: string;
  openLibraryId?: string;
  isbn10?: string;
  isbn13?: string;
  title: string;
  subtitle?: string;
  authors: string[];
  description?: string;
  categories: string[];
  publisher?: string;
  publishedDate?: string;
  language?: string;
  pageCount?: number;
  thumbnail?: string;
  averageRating?: number;
  ratingsCount?: number;
  previewLink?: string;
  infoLink?: string;
  sourceProvider: string;
}

export interface BookProvider {
  search: (query: string, maxResults?: number) => Promise<NormalizedBook[]>;
  findByIsbn: (isbn: string) => Promise<NormalizedBook | null>;
}
