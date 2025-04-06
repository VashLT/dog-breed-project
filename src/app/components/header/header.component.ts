import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-header',
  imports: [MatToolbar],
  template: `
    <mat-toolbar color="transparent">
      <h2 class="mat-headline-medium">Dog Breed Viewer</h2>
    </mat-toolbar>
  `,
  styles: `
    @use '@angular/material' as mat;

    :host {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 1;
      padding: 0.5rem 1rem;

      @include mat.toolbar-overrides(
        (
          container-background-color: transparent,
          container-text-color: white,
          standard-height: var(--height-top-bar),
        )
      );
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
