import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [
    RouterOutlet
  ],
  selector: 'ninja-root',
  template: `
    <router-outlet />
  `
})
export class App {
}
