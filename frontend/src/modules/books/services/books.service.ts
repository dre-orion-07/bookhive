import { apiClient } from "../../../lib/apiClient";
import type { Book } from "../types/book.types";

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export const booksService = {
  search: async (query: string): Promise<Book[]> => {
    const response = await apiClient.get<ApiSuccessResponse<Book[]>>("/books/search", {
      params: { q: query },
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<Book> => {
    const response = await apiClient.get<ApiSuccessResponse<Book>>(`/books/${id}`);
    return response.data.data;
  },
};
