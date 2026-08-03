import type { Book } from "../../books/types/book.types";

export interface LibraryEntry {
  id: string;
  userId: string;
  bookId: string;
  addedAt: string;
  book: Book;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  status: "want_to_read" | "currently_reading" | "completed" | "dropped" | "paused";
  currentPage: number | null;
  percentComplete: number;
  startedAt: string | null;
  finishedAt: string | null;
  notes: string | null;
}

export interface UpdateProgressPayload {
  status?: ReadingProgress["status"];
  currentPage?: number;
  percentComplete?: number;
  notes?: string;
}
