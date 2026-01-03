import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TeamsApi {
  private readonly http = inject(HttpClient);

}
