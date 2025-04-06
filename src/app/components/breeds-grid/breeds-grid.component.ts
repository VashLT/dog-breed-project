import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { BreedItemComponent } from '@components/breed-item/breed-item.component';
import { BreedDetailDialogComponent } from '@components/breed-detail-dialog/breed-detail-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { downloadFile } from '@utils/files';
import { tryCatch } from '@utils/try-catch';
import { SnackbarService } from '@services/snackbar.service';

@Component({
  selector: 'app-breeds-grid',
  imports: [MatGridListModule, BreedItemComponent, MatDialogModule],
  template: `
    @for (src of breeds(); track src) {
      <app-breed-item
        [src]="src"
        (press)="onItemPress($event)"
        (download)="onItemDownload($event)"
        (explore)="onItemExplore($event)"
        [canSearch]="canSearchFromImages()"
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
   * Whether the images have search action. This is an action for the random images, to
   * allow the user to search for a breed by image.
   */
  canSearchFromImages = input<boolean>(false);
  /**
   * Emits the breed name when the item is explored
   */
  explore = output<string>();
  /**
   * Open the dialog to show the breed detail
   * @param src url of the breed image
   */
  constructor(private readonly snackbar: SnackbarService) {}
  onItemPress(src: string) {
    this.dialog.open(BreedDetailDialogComponent, {
      data: src,
    });
  }
  /**
   * Download the image
   * @param src url of the breed image
   */
  async onItemDownload(src: string) {
    const name = src.split('/').pop();
    if (!name) {
      return;
    }

    const { error } = await tryCatch(downloadFile(src, name));
    if (error) {
      console.error(error);
      this.snackbar.show({
        message: 'Error downloading image',
        type: 'error',
      });
    }
  }
  /**
   * Explore the breed
   * @param breed name of the breed
   */
  onItemExplore(breed: string) {
    this.explore.emit(breed);
  }
}
