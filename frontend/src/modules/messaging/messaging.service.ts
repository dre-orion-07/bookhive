import { apiClient } from "../../lib/apiClient";

export type Conversation = {
  id: string;
  title?: string | null;
  type?: "PRIVATE" | "GROUP" | "CLUB";
  participantIds: string[];
  lastMessageId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: string[];
  createdAt: string;
};

export type CreateConversationInput = {
  title?: string;
  type: "PRIVATE" | "GROUP" | "CLUB";
  clubId?: string | null;
  participantIds: string[];
};

export const messagingApi = {
  createConversation: (payload: CreateConversationInput) =>
    apiClient
      .post<unknown, { data: { data: Conversation } }>(`/messaging/conversations`, payload)
      .then((r) => r.data.data),
  listConversations: () =>
    apiClient
      .get<unknown, { data: { data: Conversation[] } }>(`/messaging/conversations`)
      .then((r) => r.data.data),
  getMessages: (conversationId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<unknown, { data: { data: Message[] } }>(
        `/messaging/conversations/${conversationId}/messages`,
        { params }
      )
      .then((r) => r.data.data),
  sendMessage: (conversationId: string, payload: { content: string; attachments?: string[] }) =>
    apiClient
      .post(`/messaging/conversations/${conversationId}/messages`, payload)
      .then((r) => r.data.data as Message),
  markRead: (conversationId: string, payload: { messageId: string }) =>
    apiClient
      .post(`/messaging/conversations/${conversationId}/read`, payload)
      .then((r) => r.data.data),
};
