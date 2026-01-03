import { createAction, props } from '@ngrx/store';
import { TeamMenuItem } from '../team-menu-item';

export const LoadTeams = createAction(
  '[HomeFacade] Load Teams'
);

export const LoadTeamsSuccess = createAction(
  '[TeamsApi] Load Teams Success',
  props<{ teams: TeamMenuItem[] }>()
);

export const LoadTeamsFailure = createAction(
  '[TeamsApi] Load Teams Failure',
  props<{ error: string }>()
);

export const CreateTeam = createAction(
  '[Home] Create Team',
  props<{ teamName: string }>()
);

export const CreateTeamSuccess = createAction(
  '[TeamsApi] Create Team Success',
  props<{ team: TeamMenuItem }>()
);

export const CreateTeamFailure = createAction(
  '[TeamsApi] Create Team Failure',
  props<{ error: string }>()
);
