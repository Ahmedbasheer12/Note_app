import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    RouterLink,
    RouterLinkActive,
  ],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" routerLink="/tabs/dashboard" routerLinkActive="tab-button-active">
          <i class="fa-solid fa-chart-pie" aria-hidden="true"></i>
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>
        <ion-tab-button
          tab="notes"
          routerLink="/tabs/notes"
          routerLinkActive="tab-button-active"
          [routerLinkActiveOptions]="{ exact: false }"
        >
          <i class="fa-solid fa-note-sticky" aria-hidden="true"></i>
          <ion-label>Notes</ion-label>
        </ion-tab-button>
        <ion-tab-button
          tab="todos"
          routerLink="/tabs/todos"
          routerLinkActive="tab-button-active"
          [routerLinkActiveOptions]="{ exact: false }"
        >
          <i class="fa-solid fa-list-check" aria-hidden="true"></i>
          <ion-label>Tasks</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {}
