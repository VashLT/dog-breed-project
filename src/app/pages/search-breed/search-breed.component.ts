import { SearchComponent } from '@/app/components/search/search.component';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { BreedsGridComponent } from '@components/breeds-grid/breeds-grid.component';
import { DogApiService } from '@services/dog.api.service';
import { BreedQuery } from '@models/breed.model';

@Component({
  selector: 'app-search-breed',
  imports: [SearchComponent, BreedsGridComponent],
  template: `
    <div class="container-search-breed">
      <h1>Search your favorite dog breed</h1>
      <p class="mat-body-large">
        Explore the world of dogs with our breed search tool
      </p>
      <app-search (selectedBreed)="onSelectedBreed($event)"></app-search>
    </div>
    @if (breeds.value(); as searchedBreeds) {
      <app-breeds-grid [breeds]="searchedBreeds"></app-breeds-grid>
    } @else if (breeds.isLoading()) {
      Loading...
    } @else if (breeds.error()) {
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
   * Function to handle the breed selected by the user.
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
