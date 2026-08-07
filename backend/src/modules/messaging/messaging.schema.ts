import { z } from "zod";

export const createConversationSchema = z.object({
  title: z.string().max(200).optional(),
  type: z.enum(["PRIVATE", "GROUP", "CLUB"]),
  clubId: z.string().optional(),
  participantIds: z.array(z.string()).min(1),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  attachments: z.array(z.string()).optional(),
});

export const markReadSchema = z.object({
  messageId: z.string(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
