import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
} from '@ionic/angular/standalone';
import { Note } from '../core/models/note.model';
import { StorageService } from '../core/services/storage.service';

function newNoteId(): string {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
  ],
  templateUrl: './note-editor.page.html',
  styleUrl: './note-editor.page.scss',
})
export class NoteEditorPage implements OnInit {
  private readonly storage = inject(StorageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isNew = signal(true);
  readonly noteId = signal<string | null>(null);

  title = '';
  body = '';
  category = 'General';
  pinned = false;

  async ngOnInit(): Promise<void> {
    await this.storage.whenReady();
    const path = this.route.snapshot.routeConfig?.path;
    const isNewPath = path === 'new';
    this.isNew.set(isNewPath);

    if (isNewPath) {
      this.noteId.set(null);
      this.title = '';
      this.body = '';
      this.category = 'General';
      this.pinned = false;
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    this.noteId.set(id);
    if (!id) {
      void this.router.navigate(['/tabs/notes']);
      return;
    }
    const found = this.storage.getNoteById(id);
    if (!found) {
      void this.router.navigate(['/tabs/notes']);
      return;
    }
    this.title = found.title;
    this.body = found.body;
    this.category = found.category;
    this.pinned = !!found.pinned;
  }

  async save(): Promise<void> {
    await this.storage.whenReady();
    const now = new Date().toISOString();
    let id = this.noteId();
    if (this.isNew() || !id) {
      id = newNoteId();
    }
    const note: Note = {
      id,
      title: this.title.trim() || 'Untitled',
      body: this.body.trim(),
      category: this.category.trim() || 'General',
      updatedAt: now,
      pinned: this.pinned,
    };
    await this.storage.upsertNote(note);
    void this.router.navigate(['/tabs/notes']);
  }
}
