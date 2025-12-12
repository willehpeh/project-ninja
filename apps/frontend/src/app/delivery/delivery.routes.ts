import { Routes } from '@angular/router';

export const deliveryRoutes: Routes = [
  { path: 'board', loadComponent: () => import('./board/board').then(c => c.Board) },
  { path: '', redirectTo: 'board', pathMatch: 'full' }
];
