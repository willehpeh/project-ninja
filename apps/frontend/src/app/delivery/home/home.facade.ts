import { Injectable, signal, Signal } from '@angular/core';
import { TeamMenuItem } from '../team-menu-item';

@Injectable()
export class HomeFacade {
  allTeams(): Signal<TeamMenuItem[]> {
    return signal([]);
  }
}
