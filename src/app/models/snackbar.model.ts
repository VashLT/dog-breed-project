import { MatSnackBarConfig } from '@angular/material/snack-bar';

export interface SnackbarArgs {
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
  options?: MatSnackBarConfig;
}
