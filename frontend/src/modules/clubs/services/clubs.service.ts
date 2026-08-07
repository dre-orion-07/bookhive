import { apiClient } from "../../../lib/apiClient";
import type {
  BookClub,
  BookClubWithMemberCount,
  ClubEvent,
  ClubMember,
  ClubDiscussion,
  ClubComment,
  CreateDiscussionInput,
  UpdateDiscussionInput,
  CreateCommentInput,
  UpdateCommentInput,
  CreateClubInput,
  CreateEventInput,
  UpdateClubInput,
} from "../types/club.types";

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export const clubsService = {
  listPublic: async (): Promise<BookClub[]> => {
    const response = await apiClient.get<ApiSuccessResponse<BookClub[]>>("/clubs");
    return response.data.data;
  },

  create: async (input: CreateClubInput): Promise<BookClub> => {
    const response = await apiClient.post<ApiSuccessResponse<BookClub>>("/clubs", input);
    return response.data.data;
  },

  getById: async (clubId: string): Promise<BookClubWithMemberCount> => {
    const response = await apiClient.get<ApiSuccessResponse<BookClubWithMemberCount>>(
      `/clubs/${clubId}`
    );
    return response.data.data;
  },

  update: async (clubId: string, input: UpdateClubInput): Promise<BookClub> => {
    const response = await apiClient.patch<ApiSuccessResponse<BookClub>>(`/clubs/${clubId}`, input);
    return response.data.data;
  },

  delete: async (clubId: string): Promise<BookClub | null> => {
    const response = await apiClient.delete<ApiSuccessResponse<BookClub | null>>(
      `/clubs/${clubId}`
    );
    return response.data.data;
  },

  join: async (clubId: string): Promise<ClubMember> => {
    const response = await apiClient.post<ApiSuccessResponse<ClubMember>>(`/clubs/${clubId}/join`);
    return response.data.data;
  },

  leave: async (clubId: string): Promise<ClubMember | null> => {
    const response = await apiClient.post<ApiSuccessResponse<ClubMember | null>>(
      `/clubs/${clubId}/leave`
    );
    return response.data.data;
  },

  listMembers: async (clubId: string): Promise<ClubMember[]> => {
    const response = await apiClient.get<ApiSuccessResponse<ClubMember[]>>(
      `/clubs/${clubId}/members`
    );
    return response.data.data;
  },

  createEvent: async (clubId: string, input: CreateEventInput): Promise<ClubEvent> => {
    const response = await apiClient.post<ApiSuccessResponse<ClubEvent>>(
      `/clubs/${clubId}/events`,
      input
    );
    return response.data.data;
  },

  listUpcomingEvents: async (clubId: string): Promise<ClubEvent[]> => {
    const response = await apiClient.get<ApiSuccessResponse<ClubEvent[]>>(
      `/clubs/${clubId}/events`
    );
    return response.data.data;
  },

  /* Discussions */
  listDiscussions: async (clubId: string, page = 1, limit = 20): Promise<ClubDiscussion[]> => {
    const response = await apiClient.get<ApiSuccessResponse<ClubDiscussion[]>>(
      `/clubs/${clubId}/discussions?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  createDiscussion: async (
    clubId: string,
    input: CreateDiscussionInput
  ): Promise<ClubDiscussion> => {
    const response = await apiClient.post<ApiSuccessResponse<ClubDiscussion>>(
      `/clubs/${clubId}/discussions`,
      input
    );
    return response.data.data;
  },

  getDiscussionById: async (clubId: string, discussionId: string): Promise<ClubDiscussion> => {
    const response = await apiClient.get<ApiSuccessResponse<ClubDiscussion>>(
      `/clubs/${clubId}/discussions/${discussionId}`
    );
    return response.data.data;
  },

  updateDiscussion: async (
    clubId: string,
    discussionId: string,
    input: UpdateDiscussionInput
  ): Promise<ClubDiscussion> => {
    const response = await apiClient.patch<ApiSuccessResponse<ClubDiscussion>>(
      `/clubs/${clubId}/discussions/${discussionId}`,
      input
    );
    return response.data.data;
  },

  deleteDiscussion: async (
    clubId: string,
    discussionId: string
  ): Promise<ClubDiscussion | null> => {
    const response = await apiClient.delete<ApiSuccessResponse<ClubDiscussion | null>>(
      `/clubs/${clubId}/discussions/${discussionId}`
    );
    return response.data.data;
  },

  listComments: async (
    clubId: string,
    discussionId: string,
    page = 1,
    limit = 20
  ): Promise<ClubComment[]> => {
    const response = await apiClient.get<ApiSuccessResponse<ClubComment[]>>(
      `/clubs/${clubId}/discussions/${discussionId}/comments?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  createComment: async (
    clubId: string,
    discussionId: string,
    input: CreateCommentInput
  ): Promise<ClubComment> => {
    const response = await apiClient.post<ApiSuccessResponse<ClubComment>>(
      `/clubs/${clubId}/discussions/${discussionId}/comments`,
      input
    );
    return response.data.data;
  },

  updateComment: async (
    clubId: string,
    discussionId: string,
    commentId: string,
    input: UpdateCommentInput
  ): Promise<ClubComment> => {
    const response = await apiClient.patch<ApiSuccessResponse<ClubComment>>(
      `/clubs/${clubId}/discussions/${discussionId}/comments/${commentId}`,
      input
    );
    return response.data.data;
  },

  deleteComment: async (
    clubId: string,
    discussionId: string,
    commentId: string
  ): Promise<ClubComment | null> => {
    const response = await apiClient.delete<ApiSuccessResponse<ClubComment | null>>(
      `/clubs/${clubId}/discussions/${discussionId}/comments/${commentId}`
    );
    return response.data.data;
  },

  /* Member management */
  promoteMember: async (clubId: string, userId: string): Promise<ClubMember> => {
    const response = await apiClient.post<ApiSuccessResponse<ClubMember>>(
      `/clubs/${clubId}/members/${userId}/promote`
    );
    return response.data.data;
  },

  demoteMember: async (clubId: string, userId: string): Promise<ClubMember> => {
    const response = await apiClient.post<ApiSuccessResponse<ClubMember>>(
      `/clubs/${clubId}/members/${userId}/demote`
    );
    return response.data.data;
  },

  removeMember: async (clubId: string, userId: string): Promise<null> => {
    const response = await apiClient.post<ApiSuccessResponse<null>>(
      `/clubs/${clubId}/members/${userId}/remove`
    );
    return response.data.data;
  },

  transferOwnership: async (clubId: string, userId: string): Promise<BookClub> => {
    const response = await apiClient.post<ApiSuccessResponse<BookClub>>(
      `/clubs/${clubId}/transfer-ownership/${userId}`
    );
    return response.data.data;
  },
};
