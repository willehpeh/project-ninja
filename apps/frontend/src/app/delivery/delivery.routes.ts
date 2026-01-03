import { Routes } from '@angular/router';
import { HomeFacade } from './home/home.facade';
import { TeamsApi } from './teams-api';
import { provideState } from '@ngrx/store';
import * as fromTeams from './state/teams.reducer';
import { provideEffects } from '@ngrx/effects';
import { TeamsEffects } from './state/teams.effects';

export const deliveryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then(c => c.DeliveryHome),
    children: [

    ],
    providers: [
      HomeFacade,
      TeamsApi,
      provideState(fromTeams.featureKey, fromTeams.reducer),
      provideEffects([TeamsEffects])
    ]
  }
];
