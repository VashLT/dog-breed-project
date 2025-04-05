import { Component } from '@angular/core';
import { HeaderComponent } from '@components/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet],
  template: `
    <app-header />
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'dog-breed-project';

  method() {
    return 'hola';
  }
}
