import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'dark' | 'light';

const THEME_KEY = 'noteapp_theme_v1';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  private readonly mode$ = new BehaviorSubject<ThemeMode>('dark');
  readonly theme$ = this.mode$.asObservable();

  constructor() {
    const stored = this.readStoredTheme();
    if (stored) {
      this.apply(stored, false);
    } else {
      this.apply('dark', false);
    }
  }

  get mode(): ThemeMode {
    return this.mode$.value;
  }

  private readStoredTheme(): ThemeMode | null {
    try {
      const v = localStorage.getItem(THEME_KEY);
      if (v === 'light' || v === 'dark') {
        return v;
      }
    } catch {
      /* storage may be blocked */
    }
    return null;
  }

  toggle(): void {
    const next: ThemeMode = this.mode$.value === 'dark' ? 'light' : 'dark';
    this.apply(next, true);
  }

  setMode(mode: ThemeMode): void {
    this.apply(mode, true);
  }

  private apply(mode: ThemeMode, persist: boolean): void {
    this.mode$.next(mode);
    const root = this.doc.documentElement;
    root.setAttribute('data-theme', mode);
    root.style.colorScheme = mode === 'dark' ? 'dark' : 'light';
    if (!persist) {
      return;
    }
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* ignore */
    }
  }
}
