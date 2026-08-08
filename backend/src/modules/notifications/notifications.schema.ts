import { z } from "zod";

export const notificationPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const notificationIdSchema = z.object({
  id: z.string().trim().min(1, "Notification ID is required."),
});

export type NotificationPaginationInput = z.infer<typeof notificationPaginationSchema>;
