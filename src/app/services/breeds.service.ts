import { Injectable, signal } from '@angular/core';
import { BreedItem } from '@models/breed.model';
import { downloadFile } from '@utils/files';
import { tryCatch } from '@utils/try-catch';
import { SnackbarService } from './snackbar.service';
/**
 * Service to handle communication between the search-breed and the breed-detail-dialog components.
 */
@Injectable({
  providedIn: 'root',
})
export class BreedsService {
  /**
   * Trigger a search for a breed
   */
  search = signal<string>('');

  constructor(private readonly snackbar: SnackbarService) {}
  /**
   * Download the image from the data url
   * @param item - The item to download
   */
  async downloadSrc({ src, name }: BreedItem) {
    const { error } = await tryCatch(downloadFile(src, name));
    if (error) {
      console.error('Error downloading image:', error);
      this.snackbar.show({
        message: 'Error downloading image',
        type: 'error',
      });
    }
  }
}
