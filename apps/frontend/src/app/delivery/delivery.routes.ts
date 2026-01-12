import { Routes } from '@angular/router';
import { TeamSelectionFacade } from './team-selection/team-selection.facade';
import { TeamsApi } from './teams-api';
import { provideState } from '@ngrx/store';
import * as fromTeams from './state/teams.reducer';
import { provideEffects } from '@ngrx/effects';
import { TeamsEffects } from './state/teams.effects';

export const deliveryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./team-selection/team-selection').then(c => c.TeamSelection),
    children: [

    ],
    providers: [
      TeamSelectionFacade,
      TeamsApi,
      provideState(fromTeams.featureKey, fromTeams.reducer),
      provideEffects([TeamsEffects])
    ]
  }
];
