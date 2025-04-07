import { Injectable, signal } from '@angular/core';
import { BreedItem } from '@models/breed.model';
import { downloadFile } from '@utils/files';
import { tryCatch } from '@utils/try-catch';
import { SnackbarService } from '@services/snackbar.service';
import { LIKED_BREEDS_KEY } from '@constants/keys';
import { FilterToggle } from '@models/filter-toggle.model';
import { FILTER_OPTIONS } from '@constants/misc';
/**
 * Service to handle communication between the search-breed and the breed-detail-dialog components.
 */
@Injectable({
  providedIn: 'root',
})
export class BreedsService {
  likedBreeds = signal<string[]>([]);
  /**
   * Trigger a search for a breed
   */
  search = signal<string>('');
  /**
   * The filter to apply to the search
   */
  filter = signal<FilterToggle>(FILTER_OPTIONS[0]);

  constructor(private readonly snackbar: SnackbarService) {
    this.fetchLikedBreeds();
  }
  /**
   * Fetch the liked breeds from the local storage
   */
  fetchLikedBreeds() {
    this.likedBreeds.set(
      JSON.parse(localStorage.getItem(LIKED_BREEDS_KEY) ?? '[]'),
    );
  }
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
  /**
   * Add a breed to the liked breeds list
   * @param src - The source of the breed to add
   */
  addLikedBreed(src: string) {
    this.likedBreeds.update((prev) => [...prev, src]);
    localStorage.setItem(LIKED_BREEDS_KEY, JSON.stringify(this.likedBreeds()));
  }
  /**
   * Remove a breed from the liked breeds list
   * @param src - The source of the breed to remove
   */
  removeLikedBreed(src: string) {
    this.likedBreeds.update((prev) => prev.filter((breed) => breed !== src));
    localStorage.setItem(LIKED_BREEDS_KEY, JSON.stringify(this.likedBreeds()));
  }
}
