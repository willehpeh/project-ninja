import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '@ninja-4-vs/ui-elements';

@Component({
  imports: [
    RouterOutlet,
    Header
  ],
  selector: 'ninja-root',
  template: `
    <ninja-header />
    <div class="p-6 max-w-screen-xl mx-auto">
      <router-outlet />
    </div>
  `
})
export class App {
}
