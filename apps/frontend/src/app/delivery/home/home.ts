import { Component, inject } from '@angular/core';
import { HomeFacade } from './home.facade';
import { Button } from '@ninja-4-vs/ui-elements';

@Component({
  imports: [
    Button
  ],
  template: `
    <ninja-button (click)="onAddTeam()">Add Team</ninja-button>
  `
})
export class DeliveryHome {
  private readonly homeFacade = inject(HomeFacade);

  protected onAddTeam() {
    this.homeFacade.addTeam('New Team');
  }
}
