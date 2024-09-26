export interface Task {
  id: number;
  title: string;
  description: string;
  done: boolean;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}
