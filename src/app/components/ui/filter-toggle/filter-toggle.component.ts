import { FilterToggle } from '@models/filter-toggle.model';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-filter-toggle',
  imports: [MatIconModule, MatRippleModule],
  template: `@for (option of options(); track option.name) {
    <button
      class="filter-toggle-option"
      [class.selected]="option.name === _selected()?.name"
      (click)="onSelect(option.name, $event)"
      (keydown)="onSelect(option.name, $event)"
      matRipple
    >
      <mat-icon>{{ option.icon }}</mat-icon>
      {{ option.name }}
    </button>
  }`,
  styleUrl: './filter-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterToggleComponent {
  options = input.required<FilterToggle[]>();
  /**
   * The selected option. It is linked to the options input.
   * It is a linked signal because it depends on the options input.
   */
  _selected = linkedSignal<FilterToggle | null>(() => {
    const selected = this.options().find((opt) => opt.selected);
    if (!selected) {
      return null;
    }
    return selected;
  });
  /**
   * Emits the selected option.
   */
  selected = output<FilterToggle>();
  /**
   * Select an option
   * @param name - The name of the option to select
   */
  onSelect(name: string, event: MouseEvent | KeyboardEvent) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') {
      return;
    }
    const opt = this.options().find((opt) => opt.name === name);
    if (!opt) {
      return;
    }
    this._selected.set(opt);
    this.selected.emit(opt);
  }
}
