import { TestBed } from '@angular/core/testing';
import { BreedsService } from './breeds.service';
import { SnackbarService } from '@services/snackbar/snackbar.service';
import { LIKED_BREEDS_KEY } from '@constants/keys';
import { FILTER_OPTIONS } from '@constants/misc';

describe('BreedsService', () => {
  let service: BreedsService;
  let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
  let localStorageSpy: jasmine.Spy;
  let localStorageGetItemSpy: jasmine.Spy;

  beforeEach(() => {
    // Create spies
    snackbarServiceSpy = jasmine.createSpyObj('SnackbarService', ['show']);
    localStorageSpy = spyOn(localStorage, 'setItem');
    localStorageGetItemSpy = spyOn(localStorage, 'getItem');

    TestBed.configureTestingModule({
      providers: [
        BreedsService,
        { provide: SnackbarService, useValue: snackbarServiceSpy },
      ],
    });

    // Default spy implementation for localStorage.getItem
    localStorageGetItemSpy.and.returnValue('["breed1.jpg", "breed2.jpg"]');
  });

  it('should be created', () => {
    service = TestBed.inject(BreedsService);
    expect(service).toBeTruthy();
  });

  it('should initialize signals with default values', () => {
    service = TestBed.inject(BreedsService);
    expect(service.search()).toBe('');
    expect(service.filter()).toEqual(FILTER_OPTIONS[0]);
  });

  it('should load liked breeds from localStorage on creation', () => {
    const mockBreeds = ['breed1.jpg', 'breed2.jpg'];
    localStorageGetItemSpy.and.returnValue(JSON.stringify(mockBreeds));

    service = TestBed.inject(BreedsService);

    expect(localStorageGetItemSpy).toHaveBeenCalledWith(LIKED_BREEDS_KEY);
    expect(service.likedBreeds()).toEqual(mockBreeds);
  });

  it('should handle empty localStorage on creation', () => {
    localStorageGetItemSpy.and.returnValue(null);

    service = TestBed.inject(BreedsService);

    expect(service.likedBreeds()).toEqual([]);
  });

  it('should handle invalid localStorage data on creation', () => {
    // This will cause JSON.parse to throw an error
    localStorageGetItemSpy.and.returnValue('{invalid json');

    expect(() => {
      service = TestBed.inject(BreedsService);
    }).toThrow();
  });

  describe('fetchLikedBreeds', () => {
    it('should update likedBreeds signal with data from localStorage', () => {
      service = TestBed.inject(BreedsService);

      const newBreeds = ['new1.jpg', 'new2.jpg', 'new3.jpg'];
      localStorageGetItemSpy.and.returnValue(JSON.stringify(newBreeds));

      service.fetchLikedBreeds();

      expect(service.likedBreeds()).toEqual(newBreeds);
    });
  });

  describe('addLikedBreed', () => {
    beforeEach(() => {
      service = TestBed.inject(BreedsService);
      service.likedBreeds.set(['breed1.jpg', 'breed2.jpg']);
    });

    it('should add a breed to likedBreeds signal', () => {
      const newBreed = 'newbreed.jpg';

      service.addLikedBreed(newBreed);

      expect(service.likedBreeds()).toContain(newBreed);
      expect(service.likedBreeds().length).toBe(3);
    });

    it('should update localStorage when adding a breed', () => {
      const newBreed = 'newbreed.jpg';

      service.addLikedBreed(newBreed);

      const expectedBreeds = ['breed1.jpg', 'breed2.jpg', newBreed];
      expect(localStorageSpy).toHaveBeenCalledWith(
        LIKED_BREEDS_KEY,
        JSON.stringify(expectedBreeds),
      );
    });

    it('should handle adding a duplicate breed', () => {
      const existingBreed = 'breed1.jpg';

      service.addLikedBreed(existingBreed);

      // Since we're just using a simple array push, duplicates are allowed
      expect(service.likedBreeds()).toEqual([
        'breed1.jpg',
        'breed2.jpg',
        'breed1.jpg',
      ]);
      expect(service.likedBreeds().length).toBe(3);
    });
  });

  describe('removeLikedBreed', () => {
    beforeEach(() => {
      service = TestBed.inject(BreedsService);
      // Reset the likedBreeds to a known state
      service.likedBreeds.set(['breed1.jpg', 'breed2.jpg', 'breed3.jpg']);
    });

    it('should remove a breed from likedBreeds signal', () => {
      const breedToRemove = 'breed2.jpg';

      service.removeLikedBreed(breedToRemove);

      expect(service.likedBreeds()).not.toContain(breedToRemove);
      expect(service.likedBreeds().length).toBe(2);
      expect(service.likedBreeds()).toEqual(['breed1.jpg', 'breed3.jpg']);
    });

    it('should update localStorage when removing a breed', () => {
      const breedToRemove = 'breed2.jpg';

      service.removeLikedBreed(breedToRemove);

      const expectedBreeds = ['breed1.jpg', 'breed3.jpg'];
      expect(localStorageSpy).toHaveBeenCalledWith(
        LIKED_BREEDS_KEY,
        JSON.stringify(expectedBreeds),
      );
    });

    it('should handle removing a non-existent breed', () => {
      const nonExistentBreed = 'nonexistent.jpg';

      service.removeLikedBreed(nonExistentBreed);

      // Should not change the array
      expect(service.likedBreeds()).toEqual([
        'breed1.jpg',
        'breed2.jpg',
        'breed3.jpg',
      ]);
      expect(service.likedBreeds().length).toBe(3);
    });
  });

  describe('signal updates', () => {
    beforeEach(() => {
      service = TestBed.inject(BreedsService);
    });

    it('should update search signal correctly', () => {
      const searchTerm = 'bulldog';

      service.search.set(searchTerm);

      expect(service.search()).toBe(searchTerm);
    });

    it('should update filter signal correctly', () => {
      const newFilter = FILTER_OPTIONS[1];

      service.filter.set(newFilter);

      expect(service.filter()).toBe(newFilter);
    });
  });
});
