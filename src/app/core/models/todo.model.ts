export type TodoPriority = 'high' | 'medium' | 'low';

export interface TodoItem {
  id: string;
  /** Parent task list id */
  listId: string;
  title: string;
  done: boolean;
  order: number;
  priority: TodoPriority;
  createdAt: string;
}
