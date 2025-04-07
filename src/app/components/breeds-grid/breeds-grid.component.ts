import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { BreedItemComponent } from '@components/breed-item/breed-item.component';
import { BreedDetailDialogComponent } from '@components/breed-detail-dialog/breed-detail-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BreedsService } from '@services/breeds.service';
import { BreedItem } from '@models/breed.model';

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
   * Open the dialog to show the breed detail
   * @param src url of the breed image
   */
  constructor(private readonly breedsService: BreedsService) {}
  /**
   * Open the dialog to show the breed detail
   * @param src url of the breed image
   */
  onItemPress({ src, name }: BreedItem) {
    this.dialog.open(BreedDetailDialogComponent, {
      data: { src, name, canSearch: this.canSearchFromImages() },
    });
  }
  /**
   * Download the image
   * @param src url of the breed image
   */
  onItemDownload(item: BreedItem) {
    this.breedsService.downloadSrc(item);
  }
  /**
   * Explore the breed, it will trigger a search for the breed
   * @param breed name of the breed
   */
  onItemExplore({ name }: BreedItem) {
    this.breedsService.search.set(name);
  }
}
