import { DatePipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { combineLatest, map } from 'rxjs';
import { Note } from '../core/models/note.model';
import { TodoItem } from '../core/models/todo.model';
import { StorageService } from '../core/services/storage.service';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, NgClass, IonContent, RouterLink],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  readonly storage = inject(StorageService);
  readonly theme = inject(ThemeService);

  readonly vm = toSignal(
    combineLatest([
      this.storage.ready,
      this.storage.notes,
      this.storage.todos,
      this.theme.theme$,
    ]).pipe(
      map(([ready, notes, todos, themeMode]) => ({
        ready,
        notes,
        todos,
        themeMode,
      })),
    ),
    { initialValue: { ready: false, notes: [], todos: [], themeMode: 'dark' as const } },
  );

  readonly summary = toSignal(
    this.storage.todos.pipe(
      map((todos) => {
        const pending = todos.filter((t) => !t.done);
        const done = todos.length - pending.length;
        return {
          total: todos.length,
          pending: pending.length,
          done,
          nextUp: pending
            .slice()
            .sort((a, b) => a.order - b.order)
            .slice(0, 4),
        };
      }),
    ),
    { initialValue: { total: 0, pending: 0, done: 0, nextUp: [] as TodoItem[] } },
  );

  readonly recentNotes = toSignal(
    this.storage.notes.pipe(
      map((notes) =>
        notes
          .slice()
          .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
          .slice(0, 5),
      ),
    ),
    { initialValue: [] as Note[] },
  );

  bentoNoteClass(note: Note): string {
    const long = note.body.length > 140 || note.pinned;
    return long ? 'note-card--wide' : 'note-card--compact';
  }

  bentoTodoClass(todo: TodoItem, index: number): string {
    const prominent = !todo.done && todo.priority === 'high' && index === 0;
    return prominent ? 'todo-tile--prominent' : 'todo-tile--default';
  }

  onToggleTheme(): void {
    this.theme.toggle();
  }

  onToggleTodo(id: string, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    void this.storage.toggleTodo(id);
  }
}
