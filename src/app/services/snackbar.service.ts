import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarArgs } from '@models/snackbar.model';
import { SnackbarComponent } from '../components/ui/snackbar/snackbar.component';
@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private readonly snackBar: MatSnackBar) {}

  show(args: SnackbarArgs) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: {
        message: args.message,
        type: args.type,
      },
      panelClass: 'snackbar-' + args.type,
      ...args.options,
    });
  }
}
