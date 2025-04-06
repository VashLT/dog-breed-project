import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarActions,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
@Component({
  selector: 'app-snackbar',
  imports: [MatIconModule, MatIconButton, MatSnackBarActions],
  template: `
    @switch (data.type) {
      @case ('error') {
        <mat-icon>error</mat-icon>
      }
      @case ('success') {
        <mat-icon>check_circle</mat-icon>
      }
      @case ('warning') {
        <mat-icon>warning</mat-icon>
      }
      @default {
        <mat-icon>info</mat-icon>
      }
    }
    <span class="message">{{ data.message }}</span>
    <span class="actions" matSnackBarActions>
      <button
        mat-icon-button
        matSnackBarAction
        (click)="snackBarRef.dismissWithAction()"
      >
        <mat-icon> close </mat-icon>
      </button>
    </span>
  `,
  styleUrl: './snackbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackbarComponent {
  /**
   * Snackbar reference.
   */
  snackBarRef = inject(MatSnackBarRef);
  /**
   * snackbar data.
   */
  data = inject(MAT_SNACK_BAR_DATA);
}
