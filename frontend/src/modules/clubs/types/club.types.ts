export type ClubVisibility = "public" | "private" | "invite_only";
export type ClubRole = "owner" | "moderator" | "member";

export interface BookClub {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  visibility: ClubVisibility;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookClubWithMemberCount extends BookClub {
  memberCount: number;
}

export interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  role: ClubRole;
  joinedAt: string;
}

export interface ClubEvent {
  id: string;
  clubId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  videoRoomId: string | null;
  createdAt: string;
}

export interface CreateClubInput {
  name: string;
  description?: string;
  visibility: ClubVisibility;
}

export interface UpdateClubInput {
  name?: string;
  description?: string;
  visibility?: ClubVisibility;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
}

export interface ClubDiscussion {
  id: string;
  clubId: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClubComment {
  id: string;
  discussionId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscussionInput {
  title: string;
  content: string;
}

export interface UpdateDiscussionInput {
  title?: string;
  content?: string;
}

export interface CreateCommentInput {
  content: string;
}

export interface UpdateCommentInput {
  content?: string;
}
