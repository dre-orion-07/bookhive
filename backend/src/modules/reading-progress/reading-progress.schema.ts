import { z } from "zod";

export const READING_STATUSES = [
  "want_to_read",
  "currently_reading",
  "completed",
  "dropped",
  "paused",
] as const;

export const updateProgressSchema = z.object({
  status: z.enum(READING_STATUSES).optional(),
  currentPage: z.number().int().min(0).optional(),
  percentComplete: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
