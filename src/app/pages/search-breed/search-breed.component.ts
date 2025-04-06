import { SearchComponent } from '@/app/components/search/search.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { BreedsGridComponent } from '@components/breeds-grid/breeds-grid.component';
import { BreedsGridSkeletonComponent } from '@components/breeds-grid/breeds-grid-skeleton.component';
import { DogApiService } from '@services/dog.api.service';
import { BreedQuery } from '@models/breed.model';

@Component({
  selector: 'app-search-breed',
  imports: [SearchComponent, BreedsGridComponent, BreedsGridSkeletonComponent],
  template: `
    <div class="container-search-breed">
      <h1>Search your favorite <em>dog breed</em></h1>
      <p class="mat-body-large">
        Explore the world of dogs with our breed search tool
      </p>
      <app-search (selectedBreed)="onSelectedBreed($event)"></app-search>
    </div>
    @if (showingBreeds(); as showingBreeds) {
      <app-breeds-grid [breeds]="showingBreeds"></app-breeds-grid>
    } @else if (breeds.isLoading() || randomBreeds.isLoading()) {
      <app-breeds-grid-skeleton></app-breeds-grid-skeleton>
    } @else if (breeds.error() || randomBreeds.error()) {
      Error...
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
   * Function to handle the breed selected by the user.
   * if selectedBreed is empty, it means the user cleared the search.
   * @param selectedBreed - The breed selected by the user.
   */
  onSelectedBreed(selectedBreed: string) {
    if (!selectedBreed.includes('-')) {
      this.breed.set({ breed: selectedBreed, subBreed: '' });
    } else {
      // If the breed has a sub breed, split the string and set the breed and sub breed.
      const [breed, subBreed] = selectedBreed.split(' - ');
      this.breed.set({ breed, subBreed });
    }
  }
}
