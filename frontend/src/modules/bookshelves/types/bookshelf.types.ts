export interface Bookshelf {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  bookIds: string[];
  createdAt: string;
  updatedAt: string;
}
