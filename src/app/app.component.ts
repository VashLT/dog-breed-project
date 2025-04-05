import { Component } from '@angular/core';
import {
  MatCardModule,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
  MatCardActions,
} from '@angular/material/card';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [
    MatCardModule,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardActions,
    MatButton,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Dog Breed Project</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>This is a project about dog breeds.</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button>View More</button>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'dog-breed-project';

  method() {
    return 'hola';
  }
}
