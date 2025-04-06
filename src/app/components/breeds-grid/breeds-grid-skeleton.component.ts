import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-breeds-grid-skeleton',
  imports: [],
  template: `
    @for (_ of [].constructor(10); track $index) {
      <div class="item-breed skeleton"></div>
    }
  `,
  styleUrls: [
    '../breed-item/breed-item.component.scss',
    './breeds-grid.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedsGridSkeletonComponent {}
