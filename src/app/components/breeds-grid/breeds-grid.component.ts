import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { BreedItemComponent } from '@components/breed-item/breed-item.component';
import { BreedDetailDialogComponent } from '@components/breed-detail-dialog/breed-detail-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BreedsService } from '@services/breeds.service';
import { BreedItem, BreedLikeEmit } from '@models/breed.model';

@Component({
  selector: 'app-breeds-grid',
  imports: [MatGridListModule, BreedItemComponent, MatDialogModule],
  template: `
    @for (src of showingBreeds(); track src) {
      <app-breed-item
        [src]="src"
        [canSearch]="canSearchFromImages()"
        (press)="onItemPress($event)"
        (download)="onItemDownload($event)"
        (explore)="onItemExplore($event)"
        (like)="onItemLike($event)"
      ></app-breed-item>
    } @empty {
      <figure>
        <img src="/no-breeds.webp" alt="No breeds empty state" />
        @if (breedsService.filter().id === 'liked') {
          <figcaption class="mat-body-large">
            <strong>No liked breeds found</strong>
          </figcaption>
        } @else {
          <figcaption class="mat-body-large">No breeds found</figcaption>
        }
      </figure>
    }
  `,
  styleUrl: './breeds-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.empty-state]': 'showingBreeds().length === 0',
  },
})
export class BreedsGridComponent {
  readonly dialog = inject(MatDialog);
  breeds = input.required<string[]>();
  /**
   * Whether the images have search action. This is an action for the random images, to
   * allow the user to search for a breed by image.
   */
  canSearchFromImages = input<boolean>(false);
  showingBreeds = computed(() => {
    const filter = this.breedsService.filter();
    const breeds = this.breeds();
    if (filter.id === 'liked')
      return breeds.filter((breed) =>
        this.breedsService.likedBreeds().includes(breed),
      );
    return breeds;
  });
  /**
   * Open the dialog to show the breed detail
   * @param src url of the breed image
   */
  constructor(public readonly breedsService: BreedsService) {}
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
  /**
   * Like the breed
   * @param breed name of the breed
   */
  onItemLike({ src, isLiked }: BreedLikeEmit) {
    if (isLiked) {
      this.breedsService.removeLikedBreed(src);
    } else {
      this.breedsService.addLikedBreed(src);
    }
  }
}
