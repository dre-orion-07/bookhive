import { apiClient } from "../../../lib/apiClient";
import type { Bookshelf } from "../types/bookshelf.types";

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export const bookshelvesService = {
  list: async (): Promise<Bookshelf[]> => {
    const response = await apiClient.get<ApiSuccessResponse<Bookshelf[]>>("/bookshelves");
    return response.data.data;
  },

  create: async (name: string, icon?: string): Promise<Bookshelf> => {
    const response = await apiClient.post<ApiSuccessResponse<Bookshelf>>("/bookshelves", {
      name,
      icon,
    });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/bookshelves/${id}`);
  },

  addBook: async (shelfId: string, bookId: string): Promise<Bookshelf> => {
    const response = await apiClient.post<ApiSuccessResponse<Bookshelf>>(
      `/bookshelves/${shelfId}/books`,
      { bookId }
    );
    return response.data.data;
  },

  removeBook: async (shelfId: string, bookId: string): Promise<Bookshelf> => {
    const response = await apiClient.delete<ApiSuccessResponse<Bookshelf>>(
      `/bookshelves/${shelfId}/books/${bookId}`
    );
    return response.data.data;
  },
};
