export interface FollowUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
}

export interface DiscoveredReader extends FollowUser {
  sharedGenres: string[];
  sharedAuthors: string[];
  score: number;
}
