import { z } from "zod";

export const createBookshelfSchema = z.object({
  name: z.string().min(1, "Shelf name is required.").max(50),
  icon: z.string().max(10).optional(),
});

export const addBookToShelfSchema = z.object({
  bookId: z.string().min(1, "Book ID is required."),
});

export type CreateBookshelfInput = z.infer<typeof createBookshelfSchema>;
export type AddBookToShelfInput = z.infer<typeof addBookToShelfSchema>;
