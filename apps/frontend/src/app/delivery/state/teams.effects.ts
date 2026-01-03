import { inject, Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class TeamsEffects {
  private readonly actions$ = inject(Actions);
}
