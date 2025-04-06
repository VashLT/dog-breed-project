import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { BreedItemComponent } from '@components/breed-item/breed-item.component';
import { BreedDetailDialogComponent } from '../breed-detail-dialog/breed-detail-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-breeds-grid',
  imports: [MatGridListModule, BreedItemComponent, MatDialogModule],
  template: `
    @for (src of breeds(); track src) {
      <app-breed-item
        [src]="src"
        (itemClick)="onItemClick(src)"
      ></app-breed-item>
    }
  `,
  styleUrl: './breeds-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedsGridComponent {
  readonly dialog = inject(MatDialog);
  breeds = input.required<string[]>();
  /**
   * Open the dialog to show the breed detail
   * @param src url of the breed image
   */
  onItemClick(src: string) {
    this.dialog.open(BreedDetailDialogComponent, {
      data: src,
    });
  }
}
