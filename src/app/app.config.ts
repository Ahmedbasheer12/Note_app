import {
  ApplicationConfig,
  PLATFORM_ID,
} from '@angular/core';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';
import { Drivers } from '@ionic/storage';
import {
  provideStorage,
  Storage,
  StorageConfigToken,
} from '@ionic/storage-angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular(),
    provideRouter(routes),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: StorageConfigToken,
      useValue: {
        name: 'noteapp',
        storeName: 'kv',
        driverOrder: [Drivers.LocalStorage, Drivers.IndexedDB],
        description: 'Noteapp key-value store',
      },
    },
    { provide: Storage, useFactory: provideStorage, deps: [PLATFORM_ID, StorageConfigToken] },
  ],
};
