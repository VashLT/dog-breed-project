import { AsyncPipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import {
  MatAutocomplete,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { DogApiService } from '@services/dog.api.service';
import { debounceTime, distinctUntilChanged, map, startWith, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BREED_SUB_BREED_SEPARATOR } from '@/app/constants/keys';
import { MatIconButton } from '@angular/material/button';
import { BreedsService } from '@/app/services/breeds.service';
import { FilterToggleComponent } from '@components/ui/filter-toggle/filter-toggle.component';
import { FilterToggle } from '@/app/models/filter-toggle.model';
import { FILTER_OPTIONS } from '@constants/misc';
import { normalizeString } from '@/app/utils/strings';
@Component({
  selector: 'app-search',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatIconButton,
    TitleCasePipe,
    AsyncPipe,
    FilterToggleComponent,
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
            <mat-option [value]="option">{{ option | titlecase }}</mat-option>
          }
        </mat-autocomplete>
        @if (searchControl.value) {
          <button
            matSuffix
            mat-icon-button
            aria-label="Clear"
            (click)="searchControl.setValue(null)"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>
    </div>
    <app-filter-toggle
      [options]="filterOptions"
      (selected)="onSelectedFilter($event)"
    ></app-filter-toggle>
  `,
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  private readonly api = inject(DogApiService);
  readonly autoComplete = viewChild<MatAutocomplete>('auto');
  selectedBreed = output<string>();
  searchControl = new FormControl<string | null>(null);
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
          acc.push(
            ...subBreeds.map(
              (subBreed) => `${breed}${BREED_SUB_BREED_SEPARATOR}${subBreed}`,
            ),
          );
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
      if (value === null) {
        this.selectedBreed.emit('');
      }
    }),
    map((value) => this._filter(value ?? '')),
  );
  /**
   * The options for the filter toggle.
   */
  public readonly filterOptions = FILTER_OPTIONS;

  constructor(private readonly breedsService: BreedsService) {
    /**
     * Sync a new target value with the search input.
     * It behaves as if the user typed the value and selected an option.
     */
    effect(() => {
      const targetValue = this.breedsService.search();
      const autoComplete = untracked(this.autoComplete);

      this.searchControl.setValue(targetValue);

      if (autoComplete) {
        const option = autoComplete.options
          ?.toArray()
          ?.find(({ value }) => value === targetValue);
        if (option) {
          option.select();
          this.selectedBreed.emit(targetValue);
        }
      }
    });
  }
  ngOnInit(): void {
    /**
     * Initialize the search input with the value provided by the parent.
     * By default if empty, it will suggest all the breeds and sub-breeds.
     */
    this.searchControl.setValue(this.breedsService.search());
  }
  onSelectedFilter(filter: FilterToggle) {
    this.breedsService.filter.set(filter);
    if (!this.searchControl.value) {
      this.selectedBreed.emit('');
    }
  }
  /**
   * Filter the list of breeds and sub-breeds based on the search term.
   * @param value - The search term.
   * @returns The filtered list of breeds and sub-breeds.
   */
  private _filter(value: string): string[] {
    const searchTerm = normalizeString(value);

    if (!searchTerm) return this.autoCompleteBreeds();
    return this.autoCompleteBreeds().filter((breed) =>
      breed.toLowerCase().includes(searchTerm),
    );
  }
}
