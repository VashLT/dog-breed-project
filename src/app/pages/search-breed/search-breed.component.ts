import { SearchComponent } from '@/app/components/search/search.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-search-breed',
  imports: [SearchComponent],
  template: `<app-search
    (selectedBreed)="onSelectedBreed($event)"
  ></app-search>`,
  styleUrl: './search-breed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBreedComponent {
  onSelectedBreed(breed: string) {
    console.log(breed);
  }
}
