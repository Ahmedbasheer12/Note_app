export interface Note {
  id: string;
  title: string;
  body: string;
  category: string;
  updatedAt: string;
  pinned?: boolean;
}
