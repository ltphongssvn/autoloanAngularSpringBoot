import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [attr.aria-label]="'Loading ' + type">
      @switch (type) {
        @case ('card') {
          @for (i of rows; track i) {
            <div class="skeleton-card">
              <div class="skeleton-line title"></div>
              <div class="skeleton-line medium"></div>
              <div class="skeleton-line short"></div>
            </div>
          }
        }
        @case ('table') {
          <div class="skeleton-table">
            <div class="skeleton-line header"></div>
            @for (i of rows; track i) {
              <div class="skeleton-row">
                <div class="skeleton-line cell"></div>
                <div class="skeleton-line cell"></div>
                <div class="skeleton-line cell short"></div>
              </div>
            }
          </div>
        }
        @case ('form') {
          @for (i of rows; track i) {
            <div class="skeleton-field">
              <div class="skeleton-line label"></div>
              <div class="skeleton-line input"></div>
            </div>
          }
        }
        @default {
          @for (i of rows; track i) {
            <div class="skeleton-line text"></div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .skeleton-container { padding: 0.5rem 0; }
    .skeleton-line { background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%); background-size: 200% 100%; border-radius: 4px; animation: shimmer 1.5s infinite; }
    .skeleton-line.title { height: 1.25rem; width: 60%; margin-bottom: 0.75rem; }
    .skeleton-line.medium { height: 1rem; width: 80%; margin-bottom: 0.5rem; }
    .skeleton-line.short { height: 1rem; width: 40%; margin-bottom: 0.5rem; }
    .skeleton-line.text { height: 1rem; width: 100%; margin-bottom: 0.75rem; }
    .skeleton-line.header { height: 1.5rem; width: 100%; margin-bottom: 0.75rem; }
    .skeleton-line.cell { height: 1rem; flex: 1; }
    .skeleton-line.label { height: 0.85rem; width: 30%; margin-bottom: 0.35rem; }
    .skeleton-line.input { height: 2rem; width: 100%; margin-bottom: 1rem; }
    .skeleton-card { border: 1px solid #eee; border-radius: 4px; padding: 1rem; margin-bottom: 0.75rem; }
    .skeleton-table { padding: 0.5rem; }
    .skeleton-row { display: flex; gap: 1rem; margin-bottom: 0.5rem; }
    .skeleton-field { margin-bottom: 0.5rem; }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  `]
})
export class LoadingSkeletonComponent {
  @Input() type: 'card' | 'table' | 'form' | 'text' = 'text';
  @Input() count = 3;

  get rows(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
