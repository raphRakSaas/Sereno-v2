import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  host: {
    class: 'block w-full max-w-full min-w-0 overflow-x-clip',
  },
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
