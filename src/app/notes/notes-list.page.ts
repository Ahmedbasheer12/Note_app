import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/angular/standalone';
import { map } from 'rxjs';
import { Note } from '../core/models/note.model';
import { StorageService } from '../core/services/storage.service';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
  ],
  templateUrl: './notes-list.page.html',
  styleUrl: './notes-list.page.scss',
})
export class NotesListPage {
  private readonly storage = inject(StorageService);
  private readonly alerts = inject(AlertController);

  readonly query = signal('');

  readonly notes = toSignal(this.storage.notes.pipe(map((n) => [...n])), {
    initialValue: [] as Note[],
  });

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    let list = this.notes();
    if (q) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  });

  onSearch(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value ?? '';
    this.query.set(v);
  }

  async confirmDelete(note: Note, ev: Event): Promise<void> {
    ev.preventDefault();
    ev.stopPropagation();
    const a = await this.alerts.create({
      header: 'Delete note',
      message: `Delete "${note.title}"? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => void this.storage.removeNote(note.id),
        },
      ],
    });
    await a.present();
  }
}
