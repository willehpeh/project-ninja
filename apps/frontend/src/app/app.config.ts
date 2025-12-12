import { ApplicationConfig, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter([
      { path: 'delivery', loadChildren: () => import('./delivery/delivery.routes').then(m => m.deliveryRoutes) },
      { path: '', redirectTo: '/delivery', pathMatch: 'full' },
    ]),
    provideHttpClient(),
    provideStore(),
    provideStoreDevtools({
      logOnly: isDevMode(),
      maxAge: 25
    }),
    provideEffects([]),
  ],
};
