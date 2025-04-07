import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TitleCasePipe } from '@angular/common';
import { DogApiService } from '@/app/services/dog-api/dog-api.service';
import { BreedsService } from '@/app/services/breeds/breeds.service';
import { BreedList } from '@/app/models/breed.model';
import { of } from 'rxjs';
import { BREED_SUB_BREED_SEPARATOR } from '@/app/constants/keys';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { By } from '@angular/platform-browser';
import { FILTER_OPTIONS } from '@constants/misc';
import { ResourceRef, signal, WritableSignal } from '@angular/core';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let dogApiServiceSpy: jasmine.SpyObj<DogApiService>;
  let breedsServiceSpy: jasmine.SpyObj<BreedsService>;
  let loader: HarnessLoader;

  // Mock breed data
  const mockBreeds: BreedList = {
    bulldog: ['french', 'english'],
    hound: ['afghan', 'basset'],
    retriever: ['golden', 'labrador'],
    terrier: [],
  };

  // Expected autocomplete options based on mock data
  const expectedOptions = [
    'bulldog',
    `bulldog${BREED_SUB_BREED_SEPARATOR}french`,
    `bulldog${BREED_SUB_BREED_SEPARATOR}english`,
    'hound',
    `hound${BREED_SUB_BREED_SEPARATOR}afghan`,
    `hound${BREED_SUB_BREED_SEPARATOR}basset`,
    'retriever',
    `retriever${BREED_SUB_BREED_SEPARATOR}golden`,
    `retriever${BREED_SUB_BREED_SEPARATOR}labrador`,
    'terrier',
  ];

  const mockBreedResource = {
    value: signal<BreedList>(mockBreeds),
    isLoading: signal<boolean>(false),
    signal: of(mockBreeds),
  } as unknown as ResourceRef<BreedList>;

  beforeEach(async () => {
    // Create spies for services
    dogApiServiceSpy = jasmine.createSpyObj('DogApiService', ['getAllBreeds']);
    breedsServiceSpy = jasmine.createSpyObj('BreedsService', [], {
      search: signal(''),
      filter: signal(FILTER_OPTIONS[0]),
    });

    // Mock getAllBreeds to return a resource with a value function that returns the mock data
    dogApiServiceSpy.getAllBreeds.and.returnValue(mockBreedResource);

    await TestBed.configureTestingModule({
      imports: [
        SearchComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatIconModule,
        MatProgressSpinnerModule,
        TitleCasePipe,
      ],
      providers: [
        { provide: DogApiService, useValue: dogApiServiceSpy },
        { provide: BreedsService, useValue: breedsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Initialize the harness loader
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load breed data on initialization', () => {
      expect(dogApiServiceSpy.getAllBreeds).toHaveBeenCalled();
      expect(component.autoCompleteBreeds()).toEqual(expectedOptions);
    });
    it('should update search input when BreedsService.search signal changes', fakeAsync(() => {
      breedsServiceSpy.search.set('hound');
      fixture.detectChanges();
      tick();

      // Check that the search control value was updated
      expect(component.searchControl.value).toBe('hound');
    }));
  });

  describe('Autocomplete', () => {
    let autocomplete: MatAutocompleteHarness;
    beforeEach(async () => {
      autocomplete = await loader.getHarness(MatAutocompleteHarness);
      (mockBreedResource.isLoading as WritableSignal<boolean>).set(false);
    });

    it('should show spinner when loading data', () => {
      // Mock the isLoading signal to return true
      (mockBreedResource.isLoading as WritableSignal<boolean>).set(true);

      // Re-render the component
      fixture.detectChanges();

      // Check if spinner is displayed
      const spinner = fixture.debugElement.query(By.css('#search-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should emit selected breed when option is selected', fakeAsync(async () => {
      spyOn(component.selectedBreed, 'emit');

      await autocomplete.focus();
      await autocomplete.enterText('bulldog');
      const options = await autocomplete.getOptions();
      await options[0].click();

      expect(component.selectedBreed.emit).toHaveBeenCalledWith('bulldog');
    }));

    it('should clear search and emit empty string when clear button is clicked', fakeAsync(async () => {
      spyOn(component.selectedBreed, 'emit');

      await autocomplete.focus();
      await autocomplete.enterText('bulldog');
      tick(300);

      // Find and click the clear button
      const clearButton = await loader.getHarness(MatButtonHarness);
      await clearButton.click();
      tick(300);
      fixture.detectChanges();

      // Check if the input is cleared
      const value = await autocomplete.getValue();
      expect(value).toBe('');

      // Check if selectedBreed emitted empty string
      expect(component.selectedBreed.emit).toHaveBeenCalledWith('');
    }));

    it('should support multi-word search queries', fakeAsync(async () => {
      await autocomplete.focus();
      await autocomplete.enterText('retriever gold');
      tick(300); // Wait for debounce
      fixture.detectChanges();
      const options = await autocomplete.getOptions();

      expect(options.length).toBe(1);

      const optionText = await options[0].getText();
      expect(optionText).toBe('Retriever - Golden');
    }));

    it('should handle case-insensitive search', fakeAsync(async () => {
      await autocomplete.focus();
      await autocomplete.enterText('BULLDOG');
      tick(300); // wait for debounce
      fixture.detectChanges();

      const options = await autocomplete.getOptions();

      expect(options.length).toBe(3);
    }));

    it('should handle no matching results gracefully', fakeAsync(async () => {
      await autocomplete.focus();
      await autocomplete.enterText('nonexistent breed');
      tick(300);
      fixture.detectChanges();

      const options = await autocomplete.getOptions();

      expect(options.length).toBe(0);
    }));
  });

  describe('Filter', () => {
    it('should update filter when filter toggle is used', () => {
      // Simulate filter selection
      component.onSelectedFilter(FILTER_OPTIONS[1]);

      // Check if the filter was updated in the service
      expect(breedsServiceSpy.filter()).toBe(FILTER_OPTIONS[1]);
    });
  });
});
