import { Component } from '@angular/core';

@Component({
  selector: 'ninja-button',
  template: `
    <button class="rounded bg-primary-500 text-white 
                   px-2 py-1
                   cursor-pointer
                   hover:shadow-md hover:shadow-primary-300
                   active:shadow-none
                   transition-all transition-duration-200 transition-ease-in-out">
      <ng-content />
    </button>
  `
})
export class Button {}
