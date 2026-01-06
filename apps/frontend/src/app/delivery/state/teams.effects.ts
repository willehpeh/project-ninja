import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as TeamsActions from './teams.actions';
import { catchError, map, of, switchMap } from 'rxjs';
import { TeamsApi } from '../teams-api';

@Injectable()
export class TeamsEffects {
  private readonly actions$ = inject(Actions);
  private readonly teamsApi = inject(TeamsApi);

  addTeam$ = createEffect(() => this.actions$.pipe(
    ofType(TeamsActions.CreateTeam),
    switchMap(({ teamName }) => this.teamsApi.createTeam(teamName).pipe(
      map(team => TeamsActions.CreateTeamSuccess({ team })),
      catchError(error => of(TeamsActions.CreateTeamFailure({ error })))
    ))
  ));
}
