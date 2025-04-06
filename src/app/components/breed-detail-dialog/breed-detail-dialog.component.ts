import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { downloadFile } from '@/app/utils/files';
import { tryCatch } from '@/app/utils/try-catch';
import { SnackbarService } from '@/app/services/snackbar.service';

@Component({
  selector: 'app-breed-detail-dialog',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <img [src]="data" alt="Dog breed" loading="lazy" />
    <button
      mat-fab
      aria-label="Download image"
      (click)="downloadImage()"
      [disabled]="isLoading()"
    >
      <mat-icon>download</mat-icon>
    </button>
  `,
  styleUrl: './breed-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedDetailDialogComponent {
  /**
   * The image url, it's injected from the dialog data
   */
  data = inject(MAT_DIALOG_DATA);
  /**
   * The loading state of the image, for instance if the image is downloading
   */
  isLoading = signal(false);
  /**
   * Download the image from the data url
   */
  constructor(private readonly snackbar: SnackbarService) {}
  async downloadImage() {
    this.isLoading.set(true);
    const fileName = this.data.split('/').pop();
    if (!fileName) return;

    const { error } = await tryCatch(downloadFile(this.data, fileName));
    if (error) {
      console.error('Error downloading image:', error);
      this.snackbar.show({
        message: 'Error downloading image',
        type: 'error',
      });
    }

    this.isLoading.set(false);
  }
}
