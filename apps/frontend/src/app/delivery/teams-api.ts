import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TeamMenuItem } from './team-menu-item';

@Injectable()
export class TeamsApi {
  private readonly http = inject(HttpClient);

  createTeam(name: string) {
    return this.http.post<TeamMenuItem>('/api/teams/add', { name });
  }
}
