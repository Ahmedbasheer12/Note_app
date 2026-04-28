import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'notes',
        children: [
          {
            path: '',
            loadComponent: () => import('./notes/notes-list.page').then((m) => m.NotesListPage),
          },
          {
            path: 'new',
            loadComponent: () => import('./notes/note-editor.page').then((m) => m.NoteEditorPage),
          },
          {
            path: ':id',
            loadComponent: () => import('./notes/note-editor.page').then((m) => m.NoteEditorPage),
          },
        ],
      },
      {
        path: 'todos/:listId',
        loadComponent: () => import('./todos/todo-detail.page').then((m) => m.TodoDetailPage),
      },
      {
        path: 'todos',
        loadComponent: () => import('./todos/todo-lists.page').then((m) => m.TodoListsPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'tabs/dashboard',
    pathMatch: 'full',
  },
];
