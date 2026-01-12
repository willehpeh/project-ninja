import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { TeamSelectionFacade } from './team-selection.facade';
import { Button } from '@ninja-4-vs/ui-elements';

@Component({
  imports: [
    Button
  ],
  template: `
    <h1>Teams</h1>
    <ninja-button (click)="onAddTeam()">Add Team</ninja-button>
    <dialog class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" #dialog>Stuff</dialog>
  `
})
export class TeamSelection {
  private readonly homeFacade = inject(TeamSelectionFacade);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected onAddTeam() {
    this.dialog().nativeElement.showModal();
  }
}
