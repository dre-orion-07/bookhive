import { apiClient } from "../../../lib/apiClient";
import type { LibraryEntry, ReadingProgress, UpdateProgressPayload } from "../types/library.types";

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export const libraryService = {
  getLibrary: async (): Promise<LibraryEntry[]> => {
    const response = await apiClient.get<ApiSuccessResponse<LibraryEntry[]>>("/library");
    return response.data.data;
  },

  addBook: async (bookId: string): Promise<LibraryEntry> => {
    const response = await apiClient.post<ApiSuccessResponse<LibraryEntry>>("/library", {
      bookId,
    });
    return response.data.data;
  },

  removeBook: async (bookId: string): Promise<void> => {
    await apiClient.delete(`/library/${bookId}`);
  },

  getProgress: async (bookId: string): Promise<ReadingProgress | null> => {
    try {
      const response = await apiClient.get<ApiSuccessResponse<ReadingProgress>>(
        `/reading-progress/${bookId}`
      );
      return response.data.data;
    } catch {
      return null;
    }
  },

  updateProgress: async (
    bookId: string,
    payload: UpdateProgressPayload
  ): Promise<ReadingProgress> => {
    const response = await apiClient.patch<ApiSuccessResponse<ReadingProgress>>(
      `/reading-progress/${bookId}`,
      payload
    );
    return response.data.data;
  },
};
