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
    <div class="flex h-svh flex-col">
      <ninja-header />
      <div class="p-6 w-full max-w-screen-xl mx-auto flex-grow">
        <router-outlet />
      </div>
    </div>
  `
})
export class App {
}
