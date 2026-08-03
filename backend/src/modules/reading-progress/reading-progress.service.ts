import { readingProgressRepository } from "./reading-progress.repository.js";
import { booksRepository } from "../books/books.repository.js";
import { ErrorFactory } from "../../shared/errors/ErrorFactory.js";
import type { UpdateProgressInput } from "./reading-progress.schema.js";

export const readingProgressService = {
  updateProgress: async (userId: string, bookId: string, input: UpdateProgressInput) => {
    const book = await booksRepository.findById(bookId);
    if (!book) {
      throw ErrorFactory.bookNotFound();
    }

    const existing = await readingProgressRepository.findEntry(userId, bookId);

    const updateData: Parameters<typeof readingProgressRepository.upsert>[2] = { ...input };

    if (input.status === "currently_reading" && !existing?.startedAt) {
      updateData.startedAt = new Date();
    }

    if (input.status === "completed") {
      updateData.finishedAt = new Date();
      updateData.percentComplete = 100;
    }

    return readingProgressRepository.upsert(userId, bookId, updateData);
  },

  getProgress: async (userId: string, bookId: string) => {
    const entry = await readingProgressRepository.findEntry(userId, bookId);
    if (!entry) {
      throw ErrorFactory.bookNotFound();
    }
    return entry;
  },

  getReadingHistory: async (userId: string, status?: string) => {
    return readingProgressRepository.listByUser(userId, status);
  },
};
