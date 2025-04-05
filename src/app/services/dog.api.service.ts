import { HttpClient } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';
import { ApiResponse } from '@models/api.model';
import { BreedList } from '@models/breed.model';
@Injectable({
  providedIn: 'root',
})
export class DogApiService {
  private readonly BASE_URL = 'https://dog.ceo/api';

  constructor(private readonly http: HttpClient) {}
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
   * @returns
   */
  searchByBreed(breed: string) {
    return this.request<string[]>(`breed/${breed}/images`);
  }
  /**
   * Search by sub breed
   * @param breed - The breed to search for
   * @param subBreed - The sub breed to search for
   * @returns
   */
  searchBySubBreed(breed: string, subBreed: string) {
    return this.request<string[]>(`breed/${breed}/${subBreed}/images`);
  }
  /**
   * Search by breed and sub breed
   * @returns Resource for search by breed and sub breed
   */
  search(breed: Signal<string>, subBreed?: Signal<string>) {
    return rxResource({
      request: () => ({ breed: breed(), subBreed: subBreed?.() }),
      loader: ({ request: { breed, subBreed } }) => {
        if (!breed) return of(null);

        if (!subBreed) return this.searchByBreed(breed);

        return this.searchBySubBreed(breed, subBreed);
      },
    });
  }
  /**
   * Get all breeds
   * @returns Resource for all breeds
   */
  getAllBreeds() {
    return rxResource({
      loader: () => this.request<BreedList>('breeds/list/all'),
      defaultValue: {},
    });
  }
}
