import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromTeams from './teams.reducer';
import { TeamsState } from './teams.reducer';

export const selectTeamState = createFeatureSelector<TeamsState>(fromTeams.featureKey);

export const selectTeamMenuItems = createSelector(
  selectTeamState,
  state => state.teamMenuItems
);
