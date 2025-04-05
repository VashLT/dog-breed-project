import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/search-breed/search-breed.component').then(
        (m) => m.SearchBreedComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
