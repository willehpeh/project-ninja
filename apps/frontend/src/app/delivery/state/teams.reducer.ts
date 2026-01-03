import { TeamMenuItem } from '../team-menu-item';
import { createReducer, on } from '@ngrx/store';
import { CreateTeamSuccess, LoadTeamsSuccess } from './teams.actions';

export const featureKey = 'teams';

export interface TeamsState {
  teamMenuItems: TeamMenuItem[];
}

export const initialState: TeamsState = {
  teamMenuItems: [],
};

export const reducer = createReducer(
  initialState,
  on(LoadTeamsSuccess, (state, { teams }) => ({ ...state, teamMenuItems: teams })),
  on(CreateTeamSuccess, (state, { team }) => ({ ...state, teamMenuItems: [...state.teamMenuItems, team] }))
);
