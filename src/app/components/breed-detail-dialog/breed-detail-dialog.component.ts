import {
  ChangeDetectionStrategy,
  Component,
  inject,
  linkedSignal,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreedsService } from '@/app/services/breeds/breeds.service';
import { BreedDetail } from '@models/breed.model';
import { TitleCasePipe } from '@angular/common';
@Component({
  selector: 'app-breed-detail-dialog',
  imports: [MatButtonModule, MatIconModule, MatDialogClose, TitleCasePipe],
  template: `
    <button
      [tabIndex]="0"
      mat-icon-button
      class="btn-close"
      title="Close dialog"
      aria-label="Close dialog"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
    <picture>
      <img [src]="data.src" alt="Dog breed" loading="lazy" />
      <figcaption class="mat-headline-small">
        {{ data.name | titlecase }}
      </figcaption>
    </picture>
    <div class="actions">
      @if (data.canSearch) {
        <button
          class="btn-action btn-search"
          mat-mini-fab
          title="Search for breed"
          aria-label="Search for breed"
          (click)="onExplore()"
        >
          <mat-icon>search</mat-icon>
        </button>
      }
      <button
        class="btn-action btn-like"
        [class.liked]="isLiked()"
        mat-mini-fab
        title="Like breed"
        aria-label="Like breed"
        (click)="onLike()"
      >
        <mat-icon>favorite</mat-icon>
      </button>
      <button
        class="btn-action btn-download"
        mat-mini-fab
        title="Download image"
        aria-label="Download image"
        (click)="onDownload()"
      >
        <mat-icon>download</mat-icon>
      </button>
    </div>
  `,
  styleUrl: './breed-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedDetailDialogComponent implements OnInit {
  /**
   * The image url, it's injected from the dialog data
   */
  data = inject(MAT_DIALOG_DATA) as BreedDetail;
  /**
   * Whether the item is liked
   */
  isLiked = linkedSignal(() => {
    const likedBreeds = this.breedsService.likedBreeds();
    const src = this.data.src;
    return likedBreeds.some((breed) => src.includes(breed));
  });

  constructor(
    private readonly breedsService: BreedsService,
    private readonly dialogRef: MatDialogRef<BreedDetailDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.isLiked.set(
      this.breedsService
        .likedBreeds()
        .some((breed) => this.data.src.includes(breed)),
    );
  }

  async onDownload() {
    this.breedsService.downloadSrc(this.data);
  }
  /**
   * Explore the breed, it will trigger a search for the breed
   * @param breed name of the breed
   */
  onExplore() {
    this.breedsService.search.set(this.data.name);
    this.dialogRef.close();
  }
  onLike() {
    if (this.isLiked()) {
      this.breedsService.removeLikedBreed(this.data.src);
    } else {
      this.breedsService.addLikedBreed(this.data.src);
    }
  }
}
