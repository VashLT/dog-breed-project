import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreedsService } from '@services/breeds.service';
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
          aria-label="Search for breed"
          (click)="onExplore()"
        >
          <mat-icon>search</mat-icon>
        </button>
      }
      <button
        class="btn-action btn-download"
        mat-mini-fab
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
export class BreedDetailDialogComponent {
  /**
   * The image url, it's injected from the dialog data
   */
  data = inject(MAT_DIALOG_DATA) as BreedDetail;

  constructor(
    private readonly breedsService: BreedsService,
    private readonly dialogRef: MatDialogRef<BreedDetailDialogComponent>,
  ) {}

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
}
