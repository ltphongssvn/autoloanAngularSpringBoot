import { Component, ErrorHandler, inject, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AppError {
  id: number;
  message: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  private nextId = 1;
  readonly errors = signal<AppError[]>([]);
  readonly hasError = signal(false);

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error('GlobalErrorHandler caught:', error);
    this.errors.update(current => [
      { id: this.nextId++, message, timestamp: new Date() },
      ...current.slice(0, 9)
    ]);
    this.hasError.set(true);
  }

  dismiss(id: number): void {
    this.errors.update(current => current.filter(e => e.id !== id));
    if (this.errors().length === 0) {
      this.hasError.set(false);
    }
  }

  clearAll(): void {
    this.errors.set([]);
    this.hasError.set(false);
  }
}

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (errorHandler.hasError()) {
      <div class="error-boundary" role="alert">
        @for (err of errorHandler.errors(); track err.id) {
          <div class="error-item">
            <span class="error-message">{{ err.message }}</span>
            <button class="dismiss-btn" (click)="errorHandler.dismiss(err.id)" aria-label="Dismiss">&times;</button>
          </div>
        }
        @if (errorHandler.errors().length > 1) {
          <button class="clear-all-btn" (click)="errorHandler.clearAll()">Clear all errors</button>
        }
      </div>
    }
  `,
  styles: [`
    .error-boundary { position: fixed; bottom: 1rem; left: 1rem; right: 1rem; z-index: 3000; max-width: 600px; margin: 0 auto; }
    .error-item { display: flex; align-items: center; justify-content: space-between; background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px; padding: 0.75rem 1rem; margin-bottom: 0.5rem; }
    .error-message { flex: 1; margin-right: 0.5rem; font-size: 0.9rem; }
    .dismiss-btn { background: none; border: none; color: #721c24; font-size: 1.25rem; cursor: pointer; padding: 0 0.25rem; }
    .clear-all-btn { display: block; width: 100%; background: #721c24; color: #fff; border: none; border-radius: 4px; padding: 0.5rem; cursor: pointer; font-size: 0.85rem; }
  `]
})
export class ErrorBoundaryComponent {
  readonly errorHandler = inject(GlobalErrorHandler);
}
