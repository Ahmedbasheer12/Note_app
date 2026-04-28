import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { Note } from '../models/note.model';
import { TodoList } from '../models/todo-list.model';
import { TodoItem } from '../models/todo.model';

const NOTES_KEY = 'noteapp_notes_v1';
const TODOS_KEY = 'noteapp_todos_v1';
const TODO_LISTS_KEY = 'noteapp_todo_lists_v1';
const DEFAULT_LIST_ID = 'list-default';

function seedNotes(): Note[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'n1',
      title: 'Product vision',
      body:
        'Bento dashboard, glass surfaces, and motion that feels intentional — not noisy. Ship a calm default experience first, then layer power features.',
      category: 'Strategy',
      updatedAt: now,
      pinned: true,
    },
    {
      id: 'n2',
      title: 'Weekly retro',
      body: 'What slowed us down? What should we automate next?',
      category: 'Team',
      updatedAt: now,
    },
    {
      id: 'n3',
      title: 'Design tokens',
      body: 'Accent: electric violet. Secondary hits: mint. Keep contrast AA+ on charcoal/navy base.',
      category: 'Design',
      updatedAt: now,
    },
  ];
}

function seedTodoList(): TodoList {
  const now = new Date().toISOString();
  return {
    id: DEFAULT_LIST_ID,
    name: 'My tasks',
    createdAt: now,
    order: 0,
  };
}

function seedTodos(): TodoItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: 't1',
      listId: DEFAULT_LIST_ID,
      title: 'Wire up Notes list + filters',
      done: false,
      order: 0,
      priority: 'high',
      createdAt: now,
    },
    {
      id: 't2',
      listId: DEFAULT_LIST_ID,
      title: 'Todo reorder + persistence',
      done: false,
      order: 1,
      priority: 'high',
      createdAt: now,
    },
    {
      id: 't3',
      listId: DEFAULT_LIST_ID,
      title: 'Editor autosave polish',
      done: true,
      order: 2,
      priority: 'medium',
      createdAt: now,
    },
    {
      id: 't4',
      listId: DEFAULT_LIST_ID,
      title: 'Smoke test on device',
      done: false,
      order: 3,
      priority: 'low',
      createdAt: now,
    },
  ];
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = inject(Storage);

  private readonly notes$ = new BehaviorSubject<Note[]>([]);
  private readonly todos$ = new BehaviorSubject<TodoItem[]>([]);
  private readonly todoLists$ = new BehaviorSubject<TodoList[]>([]);
  private readonly ready$ = new BehaviorSubject<boolean>(false);

  private useIonicStorage = true;

  readonly notes = this.notes$.asObservable();
  readonly todos = this.todos$.asObservable();
  readonly todoLists = this.todoLists$.asObservable();
  readonly ready = this.ready$.asObservable();

  constructor() {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    try {
      await this.storage.create();
    } catch (err) {
      console.warn('[Noteapp] Ionic Storage unavailable; using localStorage JSON fallback.', err);
      this.useIonicStorage = false;
    }

    let lists = (await this.readKey(TODO_LISTS_KEY)) as TodoList[] | null;
    let todos = (await this.readKey(TODOS_KEY)) as TodoItem[] | null;
    const storedNotes = await this.readKey(NOTES_KEY);

    if (!Array.isArray(lists) || lists.length === 0) {
      lists = [seedTodoList()];
      await this.writeKey(TODO_LISTS_KEY, lists);
    }

    if (!Array.isArray(todos) || todos.length === 0) {
      todos = seedTodos();
      await this.writeKey(TODOS_KEY, todos);
    } else {
      const needsListId = todos.some((t) => !t.listId);
      if (needsListId) {
        const defaultId = lists[0]?.id ?? DEFAULT_LIST_ID;
        todos = todos.map((t) => ({ ...t, listId: t.listId ?? defaultId }));
        await this.writeKey(TODOS_KEY, todos);
      }
    }

    if (Array.isArray(storedNotes) && storedNotes.length > 0) {
      this.notes$.next(storedNotes as Note[]);
    } else {
      const seeded = seedNotes();
      this.notes$.next(seeded);
      await this.writeKey(NOTES_KEY, seeded);
    }

    this.todoLists$.next(lists);
    this.todos$.next(todos);
    this.ready$.next(true);
  }

  private async readKey(key: string): Promise<unknown | null> {
    if (this.useIonicStorage) {
      return this.storage.get(key);
    }
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) {
        return null;
      }
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  private async writeKey(key: string, value: unknown): Promise<void> {
    if (this.useIonicStorage) {
      await this.storage.set(key, value);
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('[Noteapp] Failed to persist key', key, e);
    }
  }

  async whenReady(): Promise<void> {
    if (this.ready$.value) {
      return;
    }
    await firstValueFrom(this.ready.pipe(filter(Boolean), take(1)));
  }

  private async persistNotes(value: Note[]): Promise<void> {
    await this.writeKey(NOTES_KEY, value);
  }

  private async persistTodos(value: TodoItem[]): Promise<void> {
    await this.writeKey(TODOS_KEY, value);
  }

  private async persistLists(value: TodoList[]): Promise<void> {
    await this.writeKey(TODO_LISTS_KEY, value);
  }

  async upsertNote(note: Note): Promise<void> {
    await this.whenReady();
    const next = [...this.notes$.value];
    const i = next.findIndex((n) => n.id === note.id);
    if (i >= 0) {
      next[i] = note;
    } else {
      next.unshift(note);
    }
    this.notes$.next(next);
    await this.persistNotes(next);
  }

  async removeNote(id: string): Promise<void> {
    await this.whenReady();
    const next = this.notes$.value.filter((n) => n.id !== id);
    this.notes$.next(next);
    await this.persistNotes(next);
  }

  async addTodoList(name: string): Promise<TodoList> {
    await this.whenReady();
    const now = new Date().toISOString();
    const list: TodoList = {
      id: newId('list'),
      name: name.trim() || 'New list',
      createdAt: now,
      order: this.todoLists$.value.length,
    };
    const next = [...this.todoLists$.value, list];
    this.todoLists$.next(next);
    await this.persistLists(next);
    return list;
  }

  async renameTodoList(id: string, name: string): Promise<void> {
    await this.whenReady();
    const next = this.todoLists$.value.map((l) =>
      l.id === id ? { ...l, name: name.trim() || l.name } : l,
    );
    this.todoLists$.next(next);
    await this.persistLists(next);
  }

  async removeTodoList(id: string): Promise<void> {
    await this.whenReady();
    let lists = this.todoLists$.value.filter((l) => l.id !== id);
    if (lists.length === 0) {
      const def = seedTodoList();
      const todos = this.todos$.value.map((t) =>
        t.listId === id ? { ...t, listId: def.id } : t,
      );
      this.todoLists$.next([def]);
      this.todos$.next(todos);
      await this.persistLists([def]);
      await this.persistTodos(todos);
      return;
    }
    const target = lists[0].id;
    const todos = this.todos$.value.map((t) =>
      t.listId === id ? { ...t, listId: target } : t,
    );
    this.todoLists$.next(lists);
    this.todos$.next(todos);
    await this.persistLists(lists);
    await this.persistTodos(todos);
  }

  async addTodo(listId: string, title: string, priority: TodoItem['priority'] = 'medium'): Promise<TodoItem> {
    await this.whenReady();
    const inList = this.todos$.value.filter((t) => t.listId === listId);
    const order = inList.length ? Math.max(...inList.map((t) => t.order)) + 1 : 0;
    const todo: TodoItem = {
      id: newId('todo'),
      listId,
      title: title.trim() || 'Task',
      done: false,
      order,
      priority,
      createdAt: new Date().toISOString(),
    };
    const next = [...this.todos$.value, todo];
    this.todos$.next(next);
    await this.persistTodos(next);
    return todo;
  }

  async updateTodo(id: string, patch: Partial<Pick<TodoItem, 'title' | 'priority' | 'done' | 'order'>>): Promise<void> {
    await this.whenReady();
    const next = this.todos$.value.map((t) => (t.id === id ? { ...t, ...patch } : t));
    this.todos$.next(next);
    await this.persistTodos(next);
  }

  async toggleTodo(id: string): Promise<void> {
    await this.whenReady();
    const next = this.todos$.value.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    this.todos$.next(next);
    await this.persistTodos(next);
  }

  async removeTodo(id: string): Promise<void> {
    await this.whenReady();
    const next = this.todos$.value.filter((t) => t.id !== id);
    this.todos$.next(next);
    await this.persistTodos(next);
  }

  todosForList$(listId: string) {
    return this.todos.pipe(map((items) => items.filter((t) => t.listId === listId)));
  }

  getNoteById(id: string): Note | undefined {
    return this.notes$.value.find((n) => n.id === id);
  }
}
