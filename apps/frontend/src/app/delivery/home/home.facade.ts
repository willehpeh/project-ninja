import { inject, Injectable, signal, Signal } from '@angular/core';
import { TeamMenuItem } from '../team-menu-item';
import { Store } from '@ngrx/store';
import * as TeamsActions from '../state/teams.actions';

@Injectable()
export class HomeFacade {

  private readonly store = inject(Store);

  addTeam(name: string): void {
    this.store.dispatch(TeamsActions.CreateTeam({ teamName: name }));
  }

  allTeams(): Signal<TeamMenuItem[]> {
    return signal([]);
  }
}
