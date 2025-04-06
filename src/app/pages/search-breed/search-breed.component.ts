import { SearchComponent } from '@/app/components/search/search.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { BreedsGridComponent } from '@components/breeds-grid/breeds-grid.component';
import { BreedsGridSkeletonComponent } from '@components/breeds-grid/breeds-grid-skeleton.component';
import { DogApiService } from '@services/dog.api.service';
import { BreedQuery } from '@models/breed.model';
import { BREED_SUB_BREED_SEPARATOR } from '@/app/constants/keys';
import { normalizeString } from '@/app/utils/strings';
import { SnackbarService } from '@/app/services/snackbar.service';

@Component({
  selector: 'app-search-breed',
  imports: [SearchComponent, BreedsGridComponent, BreedsGridSkeletonComponent],
  template: `
    <section class="container-search-breed">
      <h1>Search your favorite <em>dog breed</em></h1>
      <p class="mat-body-large">
        Explore the world of dogs with our breed search tool
      </p>
      <app-search
        [value]="searchValue()"
        (selectedBreed)="onSelectedBreed($event)"
      ></app-search>
    </section>
    @if (showingBreeds(); as showingBreeds) {
      <app-breeds-grid
        [breeds]="showingBreeds"
        [canSearchFromImages]="canSearchFromImages()"
        (explore)="onExplore($event)"
      ></app-breeds-grid>
    } @else if (breeds.isLoading() || randomBreeds.isLoading()) {
      <app-breeds-grid-skeleton></app-breeds-grid-skeleton>
    } @else if (breeds.error() || randomBreeds.error()) {
      <p class="mat-body-large">No breeds found</p>
    }
  `,
  styleUrl: './search-breed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBreedComponent {
  private readonly api = inject(DogApiService);
  /**
   * Signal to store the breed selected by the user.
   */
  breed = signal<BreedQuery>({ breed: '', subBreed: '' });
  /**
   * Set a custom value for the search input.
   */
  searchValue = signal<string>('');
  /**
   * Resource to handle the breeds.
   */
  breeds = this.api.search(this.breed);
  /**
   * Resource to handle the random breeds.
   */
  randomBreeds = this.api.random();
  /**
   * Signal to store the breeds to show. Initially it will show
   * the breeds from the random breeds.
   */
  showingBreeds = computed<string[] | null>(() => {
    const breeds = this.breeds.value();
    const isSearching = this.breeds.isLoading();
    const randomBreeds = this.randomBreeds.value();
    if (breeds?.length) return breeds;
    /**
     * If user is searching by default hide the random breeds.
     */
    if (isSearching || !randomBreeds?.length) return null;

    return randomBreeds;
  });
  /**
   * Whether the images have search action. This is an action for the random images, to
   * allow the user to search for a breed by image.
   */
  canSearchFromImages = computed<boolean>(() => {
    const breeds = this.breeds.value();
    const randomBreeds = this.randomBreeds.value();
    return !breeds?.length && randomBreeds?.length > 0;
  });

  constructor(private readonly snackbar: SnackbarService) {
    effect(() => {
      const results = this.breeds.value();
      if (!results?.length) return;

      this.snackbar.show({
        message: `${results.length} breeds found`,
        type: 'success',
      });
    });
  }
  /**
   * Function to handle the breed selected by the user.
   * if selectedBreed is empty, it means the user cleared the search.
   * @param selectedBreed - The breed selected by the user.
   */
  onSelectedBreed(selectedBreed: string) {
    const hasSubBreed = selectedBreed.includes(BREED_SUB_BREED_SEPARATOR);
    const normalizedSelectedBreed = normalizeString(selectedBreed);
    if (hasSubBreed) return this.onSelectedSubBreed(normalizedSelectedBreed);
    const currQuery = this.breed();
    const isDiff = currQuery.breed !== normalizedSelectedBreed;
    if (!isDiff) return;

    this.breed.set({
      breed: normalizedSelectedBreed,
      subBreed: '',
    });
  }
  onSelectedSubBreed(selectedBreed: string) {
    const [breed, subBreed] = selectedBreed.split(BREED_SUB_BREED_SEPARATOR);
    const currQuery = this.breed();
    const isDiff = currQuery.breed !== breed || currQuery.subBreed !== subBreed;
    if (!isDiff) return;

    this.breed.set({
      breed,
      subBreed,
    });
  }
  /**
   * Explore the breed, is the same as the breed selected by the user.
   * @param breed the breed to explore
   */
  onExplore(breed: string) {
    this.searchValue.set(breed);
  }
}
