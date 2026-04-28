import { NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AlertController } from '@ionic/angular/standalone';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { map } from 'rxjs';
import { TodoList } from '../core/models/todo-list.model';
import { TodoItem } from '../core/models/todo.model';
import { StorageService } from '../core/services/storage.service';

export interface TodoListCard extends TodoList {
  open: number;
  done: number;
  total: number;
}

@Component({
  selector: 'app-todo-lists',
  standalone: true,
  imports: [NgClass, RouterLink, IonContent, IonHeader, IonToolbar, IonTitle],
  templateUrl: './todo-lists.page.html',
  styleUrl: './todo-lists.page.scss',
})
export class TodoListsPage {
  readonly storage = inject(StorageService);
  private readonly alerts = inject(AlertController);

  readonly lists = toSignal(this.storage.todoLists.pipe(map((x) => [...x])), {
    initialValue: [] as TodoList[],
  });

  readonly todos = toSignal(this.storage.todos.pipe(map((x) => [...x])), {
    initialValue: [] as TodoItem[],
  });

  readonly listCards = computed((): TodoListCard[] => {
    const lists = [...this.lists()].sort((a, b) => a.order - b.order);
    const todos = this.todos();
    return lists.map((list) => {
      const inList = todos.filter((t) => t.listId === list.id);
      const done = inList.filter((t) => t.done).length;
      const total = inList.length;
      return { ...list, open: total - done, done, total };
    });
  });

  cardToneClass(index: number): string {
    return `todo-list-card--tone-${index % 4}`;
  }

  async addList(): Promise<void> {
    const a = await this.alerts.create({
      header: 'New list',
      inputs: [{ name: 'name', type: 'text', placeholder: 'List name' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: (d) => {
            const name = (d as { name?: string })?.name ?? '';
            void this.storage.addTodoList(name);
          },
        },
      ],
    });
    await a.present();
  }
}
