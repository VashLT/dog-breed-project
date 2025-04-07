import { SearchComponent } from '@components/search/search.component';
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
import { DogApiService } from '@services/dog-api/dog-api.service';
import { BreedQuery } from '@models/breed.model';
import { BREED_SUB_BREED_SEPARATOR } from '@constants/keys';
import { normalizeString } from '@utils/strings';
import { SnackbarService } from '@services/snackbar/snackbar.service';
import { BreedsService } from '@services/breeds/breeds.service';
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
  showingBreeds = linkedSignal<string[] | null | undefined>(() => {
    const breeds = this.breeds.value();
    const isSearching = this.breeds.isLoading();
    const randomBreeds = this.randomBreeds.value();
    const filter = this.breedsService.filter();
    const query = untracked(this.breed);
    /**
     * When searching always show skeletons.
     */
    if (isSearching) return null;
    /**
     * When no search is made, show all the liked breeds or the random breeds.
     */
    if (!query.breed) {
      if (filter.id === 'liked')
        /**
         * Denote this `untracked` as the filtering of liked is handled in the
         * grid component.
         */
        return untracked(this.breedsService.likedBreeds);
      else return randomBreeds;
    }

    if (breeds?.length) return breeds;
    /**
     * If user is searching by default hide the random breeds.
     */

    return randomBreeds;
  });
  /**
   * Whether the images have search action. This is an action for the random images, to
   * allow the user to search for a breed by image.
   */
  canSearchFromImages = computed<boolean>(() => {
    const breeds = this.breeds.value();
    const showingBreeds = this.showingBreeds()?.length ?? 0;
    return !breeds?.length && showingBreeds > 0;
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

      this.snackbar.show({
        message: `${results.length} breeds found`,
        type: 'info',
      });
    });
  }
  /**
   * Function to handle the breed selected by the user.
   *  @param selectedBreed - The breed selected by the user.
   */
  onSelectedBreed(selectedBreed: string) {
    const normalizedSelectedBreed = normalizeString(selectedBreed);
    const hasSubBreed = selectedBreed.includes(BREED_SUB_BREED_SEPARATOR);
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
