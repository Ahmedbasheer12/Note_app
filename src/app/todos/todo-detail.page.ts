import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular/standalone';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { map } from 'rxjs';
import { TodoItem } from '../core/models/todo.model';
import { TodoList } from '../core/models/todo-list.model';
import { StorageService } from '../core/services/storage.service';

@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [
    FormsModule,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
  ],
  templateUrl: './todo-detail.page.html',
  styleUrl: './todo-detail.page.scss',
})
export class TodoDetailPage {
  readonly storage = inject(StorageService);
  private readonly alerts = inject(AlertController);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly lists = toSignal(this.storage.todoLists.pipe(map((x) => [...x])), {
    initialValue: [] as TodoList[],
  });

  readonly listId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('listId'))),
    { initialValue: null as string | null },
  );

  readonly ready = toSignal(this.storage.ready, { initialValue: false });

  readonly allTodos = toSignal(this.storage.todos.pipe(map((x) => [...x])), {
    initialValue: [] as TodoItem[],
  });

  readonly currentList = computed(() => {
    const id = this.listId();
    if (!id) {
      return undefined;
    }
    return this.lists().find((l) => l.id === id);
  });

  newTodoTitle = '';
  editDraft = '';
  readonly editingId = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (!this.ready()) {
        return;
      }
      const id = this.listId();
      if (!id) {
        return;
      }
      if (!this.lists().some((l) => l.id === id)) {
        void this.router.navigate(['/tabs/todos']);
      }
    });
  }

  readonly visibleTodos = computed(() => {
    const id = this.listId();
    if (!id) {
      return [];
    }
    return this
      .allTodos()
      .filter((t) => t.listId === id)
      .slice()
      .sort((a, b) => a.order - b.order);
  });

  readonly progress = computed(() => {
    const items = this.visibleTodos();
    if (items.length === 0) {
      return { pct: 0, done: 0, total: 0 };
    }
    const done = items.filter((t) => t.done).length;
    return { pct: Math.round((done / items.length) * 100), done, total: items.length };
  });

  async renameList(list: TodoList): Promise<void> {
    const a = await this.alerts.create({
      header: 'Rename list',
      inputs: [
        { name: 'name', type: 'text', value: list.name, placeholder: 'Name' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (d) => {
            const name = (d as { name?: string })?.name ?? list.name;
            void this.storage.renameTodoList(list.id, name);
          },
        },
      ],
    });
    await a.present();
  }

  async deleteList(list: TodoList): Promise<void> {
    if (this.lists().length <= 1) {
      const a = await this.alerts.create({
        header: 'Cannot delete',
        message: 'You need at least one list.',
        buttons: [{ text: 'OK' }],
      });
      await a.present();
      return;
    }
    const a = await this.alerts.create({
      header: 'Delete list',
      message: `Delete "${list.name}"? Tasks in this list will be moved to another list.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.storage.removeTodoList(list.id);
            void this.router.navigate(['/tabs/todos']);
          },
        },
      ],
    });
    await a.present();
  }

  async addTodo(): Promise<void> {
    const id = this.listId();
    if (!id) {
      return;
    }
    const title = this.newTodoTitle.trim();
    if (!title) {
      return;
    }
    await this.storage.addTodo(id, title, 'medium');
    this.newTodoTitle = '';
  }

  startEdit(todo: TodoItem): void {
    this.editingId.set(todo.id);
    this.editDraft = todo.title;
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editDraft = '';
  }

  async saveEdit(id: string): Promise<void> {
    const t = this.editDraft.trim();
    if (t) {
      await this.storage.updateTodo(id, { title: t });
    }
    this.cancelEdit();
  }

  async toggle(todo: TodoItem): Promise<void> {
    await this.storage.toggleTodo(todo.id);
  }

  async removeTodo(id: string): Promise<void> {
    await this.storage.removeTodo(id);
    this.cancelEdit();
  }
}
