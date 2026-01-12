import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as TeamsActions from '../state/teams.actions';

@Injectable()
export class TeamSelectionFacade {

  private readonly store = inject(Store);

  addTeam(name: string): void {
    this.store.dispatch(TeamsActions.CreateTeam({ teamName: name }));
  }
}
