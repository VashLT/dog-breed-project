import { SearchComponent } from '@/app/components/search/search.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { BreedsGridComponent } from '@components/breeds-grid/breeds-grid.component';
import { BreedsGridSkeletonComponent } from '@components/breeds-grid/breeds-grid-skeleton.component';
import { DogApiService } from '@services/dog.api.service';
import { BreedQuery } from '@models/breed.model';
import { BREED_SUB_BREED_SEPARATOR } from '@/app/constants/keys';
import { normalizeString } from '@/app/utils/strings';
import { SnackbarService } from '@/app/services/snackbar.service';
import { BreedsService } from '@/app/services/breeds.service';
@Component({
  selector: 'app-search-breed',
  imports: [SearchComponent, BreedsGridComponent, BreedsGridSkeletonComponent],
  template: `
    <section class="container-search-breed">
      <h1>Search your favorite <em>dog breed</em></h1>
      <p class="mat-body-large">
        Explore the world of dogs with our breed search tool
      </p>
      <app-search (selectedBreed)="onSelectedBreed($event)"></app-search>
    </section>
    @if (showingBreeds(); as showingBreeds) {
      <app-breeds-grid
        [breeds]="showingBreeds"
        [canSearchFromImages]="canSearchFromImages()"
      ></app-breeds-grid>
    } @else if (breeds.isLoading() || randomBreeds.isLoading()) {
      <app-breeds-grid-skeleton></app-breeds-grid-skeleton>
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
  showingBreeds = linkedSignal<string[] | null>(() => {
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

  constructor(
    private readonly snackbar: SnackbarService,
    private readonly breedsService: BreedsService,
  ) {
    /**
     * Show a snackbar when the breeds are found.
     */
    effect(() => {
      const results = this.breeds.value();
      if (!results?.length) return;
      const filter = untracked(this.breedsService.filter);
      /**
       * Since liked breeds filter is handled by each breed item,
       * we don't need to show a snackbar in this case.
       */
      if (filter.id === 'liked') return;

      this.snackbar.show({
        message: `${results.length} breeds found`,
        type: 'info',
      });
    });
    /**
     * Effect to handle the filter.
     */
    effect(() => {
      const filter = this.breedsService.filter();
      const query = untracked(this.breed);
      if (query.breed) return;
      /**
       * Switch between liked and all breeds. Avoid changing the data source,
       * only switch the view.
       */
      if (filter.id === 'liked') {
        /**
         * If the user is searching for a liked breed, and the breed is empty,
         * set the breeds to the liked breeds.
         */
        this.showingBreeds.set(untracked(this.breedsService.likedBreeds));
      } else {
        /**
         * When filter is all, set the breeds to the random breeds when no breed is selected.
         */
        this.showingBreeds.set(untracked(this.randomBreeds.value));
      }
    });
  }
  /**
   * Function to handle the breed selected by the user.
   *  @param selectedBreed - The breed selected by the user.
   */
  onSelectedBreed(selectedBreed: string) {
    const filter = this.breedsService.filter();
    /**
     * If the user is searching for a liked breed, and the breed is empty,
     * set the breeds to the liked breeds.
     */
    if (filter.id === 'liked' && !selectedBreed) {
      this.showingBreeds.set(this.breedsService.likedBreeds());
      return;
    }
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
  /**
   * Function to handle the sub-breed selected by the user.
   * @param selectedBreed - The sub-breed selected by the user.
   */
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
}
