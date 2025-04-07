import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Injector, signal } from '@angular/core';
import { DogApiService } from './dog-api.service';
import { BreedList, BreedQuery } from '@models/breed.model';
import { SnackbarService } from '@services/snackbar/snackbar.service';
import { RANDOM_BREEDS_LIMIT } from '@constants/limits';
import { provideHttpClient } from '@angular/common/http';
import { runInContext } from '@/app/utils/tests';
import { of, throwError } from 'rxjs';

describe('DogApiService', () => {
  let service: DogApiService;
  let httpMock: HttpTestingController;
  let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
  let injector: Injector;

  const BASE_URL = 'https://dog.ceo/api';

  beforeEach(() => {
    // Create spy for SnackbarService
    const snackbarSpy = jasmine.createSpyObj('SnackbarService', ['show']);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DogApiService,
        { provide: SnackbarService, useValue: snackbarSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(DogApiService);
    injector = TestBed.inject(Injector);
    httpMock = TestBed.inject(HttpTestingController);
    snackbarServiceSpy = TestBed.inject(
      SnackbarService,
    ) as jasmine.SpyObj<SnackbarService>;
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('request', () => {
    it('should make a GET request with the correct URL and return the message property', (done) => {
      const mockResponse = {
        message: ['test1.jpg', 'test2.jpg'],
        status: 'success',
      };
      const path = 'test-path';

      service.request<string[]>(path).subscribe((result) => {
        expect(result).toEqual(mockResponse.message);
        done();
      });

      const req = httpMock.expectOne(`${BASE_URL}/${path}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('searchByBreed', () => {
    it('should return breed images when request is successful', (done) => {
      const breed = 'labrador';
      const mockImages = ['img1.jpg', 'img2.jpg'];
      const mockResponse = { message: mockImages, status: 'success' };

      service.searchByBreed(breed).subscribe((images) => {
        expect(images).toEqual(mockImages);
        done();
      });

      const req = httpMock.expectOne(`${BASE_URL}/breed/${breed}/images`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle errors and display snackbar message', (done) => {
      const breed = 'nonexistent';
      const errorMessage = 'Breed not found';

      service.searchByBreed(breed).subscribe((images) => {
        expect(images).toEqual([]);
        expect(snackbarServiceSpy.show).toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(`${BASE_URL}/breed/${breed}/images`);
      req.flush(errorMessage, { statusText: errorMessage, status: 404 });
    });
  });

  describe('searchBySubBreed', () => {
    it('should return sub-breed images when request is successful', (done) => {
      const breed = 'hound';
      const subBreed = 'afghan';
      const mockImages = ['afghan1.jpg', 'afghan2.jpg'];
      const mockResponse = { message: mockImages, status: 'success' };

      service.searchBySubBreed(breed, subBreed).subscribe((images) => {
        expect(images).toEqual(mockImages);
        done();
      });

      const req = httpMock.expectOne(
        `${BASE_URL}/breed/${breed}/${subBreed}/images`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle errors and display snackbar message', (done) => {
      const breed = 'hound';
      const subBreed = 'nonexistent';

      service.searchBySubBreed(breed, subBreed).subscribe((images) => {
        expect(images).toEqual([]);
        expect(snackbarServiceSpy.show).toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(
        `${BASE_URL}/breed/${breed}/${subBreed}/images`,
      );
      req.flush('req error', { statusText: 'req error', status: 400 });
    });
  });

  describe('search', () => {
    it('should return null when breed is empty', fakeAsync(() => {
      const query = signal<BreedQuery>({ breed: '', subBreed: '' });
      const resource = runInContext(() => service.search(query), injector);
      tick();

      const result = resource.value();
      expect(result).toBeNull();
    }));

    it('should call searchByBreed when only breed is provided', fakeAsync(() => {
      const breed = 'bulldog';
      const mockImages = ['bulldog1.jpg', 'bulldog2.jpg'];
      const query = signal<BreedQuery>({ breed, subBreed: '' });

      spyOn(service, 'searchByBreed').and.returnValue(of(mockImages));
      const resource = runInContext(() => service.search(query), injector);
      tick();

      expect(service.searchByBreed).toHaveBeenCalledWith(breed);
      expect(resource.value()).toBe(mockImages);
    }));

    it('should call searchBySubBreed when both breed and subBreed are provided', fakeAsync(() => {
      const breed = 'hound';
      const subBreed = 'afghan';
      const mockImages = ['afghan1.jpg', 'afghan2.jpg'];
      const query = signal<BreedQuery>({ breed, subBreed });

      spyOn(service, 'searchBySubBreed').and.returnValue(of(mockImages));
      const resource = runInContext(() => service.search(query), injector);
      tick();

      expect(service.searchBySubBreed).toHaveBeenCalledWith(breed, subBreed);
      expect(resource.value()).toBe(mockImages);
    }));
  });

  describe('random', () => {
    it('should request RANDOM_BREEDS_LIMIT random images', fakeAsync(() => {
      const mockImages = Array.from({ length: RANDOM_BREEDS_LIMIT }).map(
        (_, i) => `random${i}.jpg`,
      );
      let i = 0;
      spyOn(service, 'request').and.callFake(() => {
        /**
         * Mocking the request generic method causes a type error.
         * This is a workaround to avoid the type error.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return of(mockImages[i++]) as unknown as any;
      });
      const resource = runInContext(() => service.random(), injector);
      tick();

      expect(resource.value()?.length).toBe(RANDOM_BREEDS_LIMIT);
      expect(resource.value()).toEqual(mockImages);
    }));

    it('should handle errors and return empty array', fakeAsync(() => {
      spyOn(service, 'request').and.returnValue(throwError(() => 'error'));
      const resource = runInContext(() => service.random(), injector);
      tick();

      expect(resource.value()?.length).toBe(0);
      expect(snackbarServiceSpy.show).toHaveBeenCalled();
    }));
  });

  describe('getAllBreeds', () => {
    it('should return all breeds', fakeAsync(() => {
      const mockBreeds: BreedList = {
        hound: ['afghan', 'basset'],
        bulldog: ['english', 'french'],
      };
      const resource = runInContext(() => service.getAllBreeds(), injector);
      tick();

      const req = httpMock.expectOne(`${BASE_URL}/breeds/list/all`);

      req.flush({ message: mockBreeds });
      tick();
      expect(resource.value()).toEqual(mockBreeds);
    }));

    it('should return default value when request fails', fakeAsync(() => {
      const resource = runInContext(() => service.getAllBreeds(), injector);
      resource.value();
      tick();

      const req = httpMock.expectOne(`${BASE_URL}/breeds/list/all`);

      req.flush(
        { message: {}, status: 'error' },
        { statusText: 'error', status: 400 },
      );
      expect(Object.keys(resource.value())?.length).toBe(0);
    }));
  });
});
