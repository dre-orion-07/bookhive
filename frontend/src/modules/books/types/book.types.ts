export interface Book {
  id: string;
  googleBooksId: string | null;
  openLibraryId: string | null;
  isbn10: string | null;
  isbn13: string | null;
  title: string;
  subtitle: string | null;
  authors: string[];
  description: string | null;
  categories: string[];
  publisher: string | null;
  publishedDate: string | null;
  language: string | null;
  pageCount: number | null;
  thumbnail: string | null;
  averageRating: number | null;
  ratingsCount: number | null;
  previewLink: string | null;
  infoLink: string | null;
  sourceProvider: string;
}
