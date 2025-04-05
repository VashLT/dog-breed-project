import { BreedTile } from '@/app/models/breed.model';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-breeds-grid',
  imports: [MatGridListModule],
  template: ` <mat-grid-list cols="4">
    @for (tile of tiles(); track tile) {
      <mat-grid-tile [colspan]="tile.cols" [rowspan]="tile.rows">
        <img [src]="tile.src" alt="Breed" />
      </mat-grid-tile>
    }
  </mat-grid-list>`,
  styleUrl: './breeds-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedsGridComponent {
  breeds = input.required<string[]>();
  /**
   * Computed tiles, list of breeds to display in the grid.
   */
  tiles = computed<BreedTile[]>(
    () =>
      this.breeds()?.map((breed) => ({
        cols: 1,
        rows: 1,
        src: breed,
      })) ?? [],
  );
}
