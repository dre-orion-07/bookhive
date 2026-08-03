import { z } from "zod";

export const addToLibrarySchema = z.object({
  bookId: z.string().min(1, "Book ID is required."),
});

export type AddToLibraryInput = z.infer<typeof addToLibrarySchema>;
