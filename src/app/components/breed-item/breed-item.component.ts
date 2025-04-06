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

@Component({
  selector: 'app-breed-item',
  imports: [MatMiniFabButton, MatIconModule, TitleCasePipe],
  template: `<picture
    class="item-breed"
    (click)="onPress()"
    (keydown)="onPress()"
    tabindex="0"
  >
    <img
      [src]="src()"
      [title]="name() | titlecase"
      [alt]="name() | titlecase"
      loading="lazy"
    />
    <button
      class="btn-download"
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
        class="btn-search"
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
  press = output<string>();
  /**
   * Emits the source of the image when the item is downloaded
   */
  download = output<string>();
  /**
   * Emits the source of the image when the search action is triggered
   */
  explore = output<string>();
  /**
   * Title of the image, the name of the breed
   */
  name = computed(() => getBreedNameFromSrc(this.src()) ?? '');

  onPress() {
    this.press.emit(this.src());
  }

  onDownload(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
    this.download.emit(this.src());
  }

  onSearch(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
    this.explore.emit(this.name());
  }
}
