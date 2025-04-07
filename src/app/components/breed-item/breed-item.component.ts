import { getBreedNameFromSrc } from '@utils/strings';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TitleCasePipe } from '@angular/common';
import { BreedItem } from '@models/breed.model';

@Component({
  selector: 'app-breed-item',
  imports: [MatMiniFabButton, MatIconModule, TitleCasePipe],
  template: `<picture
    class="item-breed"
    (click)="onPress($event)"
    (keydown)="onPress($event)"
    tabindex="0"
  >
    <img
      [src]="src()"
      [title]="name() | titlecase"
      [alt]="name() | titlecase"
      loading="lazy"
      [tabIndex]="0"
    />
    <button
      class="btn-action btn-download"
      mat-mini-fab
      title="Download image"
      aria-label="Download image"
      (click)="onDownload($event)"
      (keydown)="onDownload($event)"
    >
      <mat-icon>download</mat-icon>
    </button>
    @if (canSearch()) {
      <button
        class="btn-action btn-search"
        mat-mini-fab
        title="Search more images of this breed"
        aria-label="Search more images of this breed"
        (click)="onSearch($event)"
        (keydown)="onSearch($event)"
      >
        <mat-icon>search</mat-icon>
      </button>
    }
  </picture>`,
  styleUrl: './breed-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedItemComponent {
  src = input.required<string>();
  /**
   * Whether the item can search for a breed by image
   */
  canSearch = input<boolean>(false);
  /**
   * Emits the source of the image when the item is clicked
   */
  press = output<BreedItem>();
  /**
   * Emits the source of the image when the item is downloaded
   */
  download = output<BreedItem>();
  /**
   * Emits the source of the image when the search action is triggered
   */
  explore = output<BreedItem>();
  /**
   * Title of the image, the name of the breed
   */
  name = computed(() => getBreedNameFromSrc(this.src()) ?? '');
  /**
   * Emits the item when the press action is triggered
   */
  onPress(event: MouseEvent | KeyboardEvent) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') {
      return;
    }
    this.press.emit({ name: this.name(), src: this.src() });
  }
  /**
   * Emits the item when the download action is triggered
   */
  onDownload(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
    if (event instanceof KeyboardEvent && event.key !== 'Enter') {
      return;
    }
    this.download.emit({ name: this.name(), src: this.src() });
  }
  /**
   * Emits the item when the search action is triggered
   */
  onSearch(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
    if (event instanceof KeyboardEvent && event.key !== 'Enter') {
      return;
    }
    this.explore.emit({ name: this.name(), src: this.src() });
  }
}
