[README.md](https://github.com/user-attachments/files/34554077/README.md)
# 📝 Note App

A modern, cross-platform **notes and to-do manager** built with **Ionic, Angular, and Capacitor**. Note App combines a clean dashboard, a searchable notes library, and multi-list task management in a single mobile-first app that runs in the browser and as a native Android app. All data is stored locally on the device, so it works offline with no account or backend required.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Data Models](#-data-models)
- [Getting Started](#-getting-started)
- [Running on Android](#-running-on-android)
- [Available Scripts](#-available-scripts)
- [Data Storage](#-data-storage)
- [Theming](#-theming)
- [Possible Improvements](#-possible-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔎 Overview

Note App is designed to keep your thoughts and tasks in one place. It is organized into three main sections, accessible from a bottom tab bar:

| Tab | Purpose |
|-----|---------|
| **Dashboard** | An at-a-glance summary of your tasks and recent notes |
| **Notes** | Create, edit, search, pin, and delete notes |
| **Tasks** | Manage multiple to-do lists with progress tracking |

The app follows a **local-first** approach: everything is saved on your device using Ionic Storage, which means there is no sign-up, no server, and no internet connection needed.

---

## ✨ Features

### 📊 Dashboard
- Summary of total, pending, and completed tasks
- "Next up" list showing your upcoming pending tasks, each with a priority label
- Recently updated notes, with a badge for pinned ones
- Quick dark/light theme toggle

### 🗒️ Notes
- Create and edit notes with a **title**, **body**, and **category**
- **Pin** important notes so they stand out
- **Search** across note titles, content, and categories
- Notes are automatically sorted by most recently updated
- Delete confirmation dialog to prevent accidental data loss
- Untitled notes fall back to the title *"Untitled"* and the category *"General"*

### ✅ Tasks
- Create **multiple task lists** (for example Work, Personal, Study)
- Add, edit, complete, and delete tasks inside each list
- Inline editing of task titles
- **Progress bar** showing the percentage of completed tasks per list
- Rename or delete lists; at least one list is always kept
- Deleting a list moves its tasks to another list instead of losing them
- Each list card shows open, done, and total task counts

### 🎨 User Experience
- **Dark and light themes**, remembered between sessions
- Modern card-based UI with glass-style surfaces
- Smooth, responsive layout built with Ionic components
- Bottom tab navigation optimized for mobile use
- Seeded sample notes and a default task list on first launch

### 📱 Cross-Platform
- Runs in any modern browser
- Packaged as a native **Android** app using Capacitor

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [Angular 20](https://angular.dev/) (standalone components, signals) |
| UI Toolkit | [Ionic 8](https://ionicframework.com/) |
| Native Runtime | [Capacitor 8](https://capacitorjs.com/) (Android) |
| Language | TypeScript |
| State and Async | RxJS (`BehaviorSubject`, `combineLatest`) and Angular signals |
| Local Storage | `@ionic/storage-angular` |
| Styling | SCSS with CSS custom properties (design tokens) |
| Icons | Font Awesome Free and Ionicons |
| Linting | ESLint with Angular ESLint |
| Testing | Jasmine and Karma |

---

## 📁 Project Structure

```
Note_app/
├── android/                      # Native Android project (Capacitor)
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/           # Note, TodoItem, TodoList interfaces
│   │   │   └── services/
│   │   │       ├── storage.service.ts   # Data layer (notes, lists, tasks)
│   │   │       └── theme.service.ts     # Dark/light theme handling
│   │   ├── dashboard/            # Dashboard page
│   │   ├── notes/                # Notes list and note editor pages
│   │   ├── todos/                # Task lists and list detail pages
│   │   ├── tabs/                 # Bottom tab navigation
│   │   ├── app.routes.ts         # Application routes (lazy loaded)
│   │   └── app.config.ts         # App configuration and providers
│   ├── assets/                   # Icons and static assets
│   ├── environments/             # Environment configuration
│   ├── styles/                   # Shared UI styles
│   ├── theme/                    # Ionic theme variables
│   ├── global.scss               # Global styles
│   └── index.html
├── angular.json
├── capacitor.config.ts
├── ionic.config.json
├── package.json
└── tsconfig.json
```

---

## 🏗️ Architecture

The app is built with Angular **standalone components** and lazy-loaded routes for fast startup.

- **Routing**: All pages sit under a `tabs` shell and are loaded lazily:
  - `/tabs/dashboard`
  - `/tabs/notes`, `/tabs/notes/new`, `/tabs/notes/:id`
  - `/tabs/todos`, `/tabs/todos/:listId`
- **Service-based state**: `StorageService` is the single source of truth. It exposes `notes`, `todoLists`, `todos`, and `ready` as observables, and pages subscribe to them using `toSignal`.
- **Reactive UI**: Derived data such as filtered notes, task progress, and list statistics is calculated with Angular `computed` signals.
- **Theme service**: `ThemeService` toggles a `data-theme` attribute on the document root and saves the preference.

---

## 🗃️ Data Models

```ts
interface Note {
  id: string;
  title: string;
  body: string;
  category: string;
  updatedAt: string;
  pinned?: boolean;
}

interface TodoList {
  id: string;
  name: string;
  createdAt: string;
  order: number;
}

type TodoPriority = 'high' | 'medium' | 'low';

interface TodoItem {
  id: string;
  listId: string;        // parent task list
  title: string;
  done: boolean;
  order: number;
  priority: TodoPriority;
  createdAt: string;
}
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (comes with Node.js)
- [Ionic CLI](https://ionicframework.com/docs/cli) (optional but recommended)

```bash
npm install -g @ionic/cli
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Note_app.git

# 2. Move into the project folder
cd Note_app

# 3. Install dependencies
npm install

# 4. Start the development server
ionic serve
# or
npm start
```

The app will open at `http://localhost:4200` (Angular default) or `http://localhost:8100` (Ionic CLI).

### Production Build

```bash
npm run build
```

The compiled output is generated in the `www/` directory.

---

## 🤖 Running on Android

Android Studio is required to build and run the native app.

```bash
# Build the web assets
npm run build

# Sync the web build into the native project
npx cap sync android

# Open the project in Android Studio
npx cap open android
```

Then run the app on an emulator or a connected device from Android Studio.

> **Note:** The default Capacitor app ID is `io.ionic.starter`. Change `appId` in `capacitor.config.ts` before publishing the app.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the development server |
| `npm run build` | Create a production build |
| `npm run watch` | Rebuild automatically on changes (development mode) |
| `npm test` | Run unit tests with Karma and Jasmine |
| `npm run lint` | Lint the codebase with ESLint |

---

## 💾 Data Storage

Note App is **local-first**:

- Notes, task lists, and tasks are saved with **Ionic Storage**
- The theme preference is saved in `localStorage`
- No account, server, or internet connection is needed
- On the first launch, the app is seeded with a few sample notes and a default **"My tasks"** list so you can see how it works right away

Storage keys are versioned (`noteapp_notes_v1`, `noteapp_todos_v1`, `noteapp_todo_lists_v1`, `noteapp_theme_v1`), which makes future data migrations easier.

---

## 🎨 Theming

The app ships with a **dark theme (default)** and a **light theme**. The theme is applied through a `data-theme` attribute on the root element, and colors are defined as CSS custom properties in `src/theme/variables.scss` and `src/styles/app-ui.scss`. Your choice is saved and restored on the next launch.

---

## 🔮 Possible Improvements

- Rich-text or Markdown support in notes
- Task priority selector and due dates in the task UI
- Drag-and-drop reordering of tasks
- Reminders and local notifications
- Cloud sync and backup
- Note tags and filters by category
- Export and import of notes as JSON
- Biometric lock for private notes
- iOS build support

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source. Add your preferred license (for example MIT) by including a `LICENSE` file in the repository.

---


