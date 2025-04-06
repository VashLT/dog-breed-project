import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-breed-item',
  imports: [],
  template: `<picture
    class="item-breed"
    (click)="onClick()"
    (keydown)="onClick()"
    tabindex="0"
  >
    <img [src]="src()" alt="Dog breed" loading="lazy" />
  </picture>`,
  styleUrl: './breed-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedItemComponent {
  src = input.required<string>();
  itemClick = output<string>();

  onClick() {
    this.itemClick.emit(this.src());
  }
}
