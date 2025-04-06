import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
} from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { DogApiService } from '@/app/services/dog.api.service';
import { debounceTime, distinctUntilChanged, map, startWith, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    @let isLoading = breeds.isLoading();
    <div class="search-container">
      <mat-form-field appearance="outline" [ariaDisabled]="isLoading">
        @if (isLoading) {
          <mat-progress-spinner
            matPrefix
            id="search-spinner"
            mode="indeterminate"
          ></mat-progress-spinner>
        } @else {
          <mat-icon matPrefix>search</mat-icon>
        }
        <input
          type="text"
          matInput
          [formControl]="searchControl"
          [matAutocomplete]="auto"
          placeholder="Type to search breeds..."
        />
        <mat-autocomplete
          #auto="matAutocomplete"
          (optionSelected)="selectedBreed.emit($event.option.value)"
        >
          @for (option of filteredOptions$ | async; track option) {
            <mat-option [value]="option">{{ option }}</mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>
    </div>
  `,
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private readonly api = inject(DogApiService);
  selectedBreed = output<string>();
  searchControl = new FormControl('');
  breeds = this.api.getAllBreeds();
  /**
   * Pre-compute all possible options for the autocomplete.
   * It's a list of all breeds and sub-breeds.
   * @example ['bulldog', 'bulldog - french', 'bulldog - english', 'bulldog - staffordshire']
   */
  autoCompleteBreeds = computed<string[]>(() => {
    const breeds = this.breeds.value();
    if (!breeds) return [];
    return Object.entries(breeds).reduce(
      (acc: string[], [breed, subBreeds]) => {
        acc.push(breed);
        if (subBreeds.length) {
          acc.push(...subBreeds.map((subBreed) => `${breed} - ${subBreed}`));
        }
        return acc;
      },
      [],
    );
  });
  /**
   * Filter the list of breeds and sub-breeds based on the search term.
   * @param value - The search term.
   * @returns The filtered list of breeds and sub-breeds.
   */
  filteredOptions$ = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    /**
     * Emits when the search term is empty.
     */
    tap((value) => {
      if (!value?.length) {
        this.selectedBreed.emit('');
      }
    }),
    map((value) => this._filter(value ?? '')),
  );
  /**
   * Filter the list of breeds and sub-breeds based on the search term.
   * @param value - The search term.
   * @returns The filtered list of breeds and sub-breeds.
   */
  private _filter(value: string): string[] {
    const searchTerm = value.toLowerCase().trim();
    if (!searchTerm) return this.autoCompleteBreeds();
    return this.autoCompleteBreeds().filter((breed) =>
      breed.toLowerCase().includes(searchTerm),
    );
  }
}
