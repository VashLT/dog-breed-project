import { HttpClient } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of } from 'rxjs';
import { ApiResponse } from '@models/api.model';
import { BreedList, BreedQuery } from '@models/breed.model';
import { RANDOM_BREEDS_LIMIT } from '@constants/limits';
import { SnackbarService } from '@services/snackbar/snackbar.service';
import { SEARCH_BREED_ERROR_MESSAGE } from '@/app/constants/messages';
@Injectable({
  providedIn: 'root',
})
export class DogApiService {
  private readonly BASE_URL = 'https://dog.ceo/api';

  constructor(
    private readonly http: HttpClient,
    private readonly snackbar: SnackbarService,
  ) {}
  /**
   * Generic for API request, can be used for all requests
   */
  request<T>(path: string) {
    return this.http
      .get<ApiResponse<T>>(`${this.BASE_URL}/${path}`)
      .pipe(map((res) => res.message));
  }
  /**
   * Search by breed
   * @param breed - The breed to search for
   * @returns Observable with the images for search by breed
   */
  searchByBreed(breed: string) {
    return this.request<string[]>(`breed/${breed}/images`).pipe(
      catchError((err) => {
        this.snackbar.show({
          message: err ?? SEARCH_BREED_ERROR_MESSAGE,
          type: 'error',
        });
        return of([]);
      }),
    );
  }
  /**
   * Search by sub breed
   * @param breed - The breed to search for
   * @param subBreed - The sub breed to search for
   * @returns Observable with the images for search by sub breed
   */
  searchBySubBreed(breed: string, subBreed: string) {
    return this.request<string[]>(`breed/${breed}/${subBreed}/images`).pipe(
      catchError((err) => {
        this.snackbar.show({
          message: err ?? 'Error searching sub breed',
          type: 'error',
        });
        return of([]);
      }),
    );
  }
  /**
   * Search by breed and sub breed
   * @param query - The query to search for
   * @returns Resource for search by breed and sub breed
   */
  search(query: Signal<BreedQuery>) {
    return rxResource({
      request: () => ({ query: query() }),
      loader: ({
        request: {
          query: { breed, subBreed },
        },
      }) => {
        if (!breed) return of(null);

        if (!subBreed) return this.searchByBreed(breed);

        return this.searchBySubBreed(breed, subBreed);
      },
    });
  }
  /**
   * Get random breeds
   * @returns Resource for random breeds
   */
  random() {
    return rxResource<string[], undefined>({
      loader: () => {
        /**
         * fetch n random images to show in the landing page
         */
        const requests = Array.from({ length: RANDOM_BREEDS_LIMIT })
          .fill(null)
          .map(() => this.request<string>('breeds/image/random'));
        return forkJoin(requests).pipe(
          catchError((err) => {
            this.snackbar.show({
              message: err ?? 'Error loading random breeds',
              type: 'error',
            });
            return of([]);
          }),
        );
      },
      defaultValue: [],
    });
  }
  /**
   * Get all breeds
   * @returns Resource for all breeds
   */
  getAllBreeds() {
    return rxResource({
      loader: () =>
        this.request<BreedList>('breeds/list/all').pipe(
          catchError((err) => {
            this.snackbar.show({
              message: err ?? 'Error loading breeds',
              type: 'error',
            });
            return of({});
          }),
        ),
      defaultValue: {},
    });
  }
}
