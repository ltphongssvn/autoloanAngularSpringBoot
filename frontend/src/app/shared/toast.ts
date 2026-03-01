import { Component, inject, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<ToastMessage[]>([]);

  show(message: string, type: ToastMessage['type'] = 'info', duration = 4000): void {
    const id = this.nextId++;
    this.toasts.update(current => [...current, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  info(message: string): void { this.show(message, 'info'); }
  warning(message: string): void { this.show(message, 'warning'); }

  dismiss(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  clearAll(): void {
    this.toasts.set([]);
  }
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [attr.data-type]="toast.type" [class]="'toast toast-' + toast.type">
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Dismiss">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; top: 1rem; right: 1rem; z-index: 3000; display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px; }
    .toast { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: 4px; color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.2); animation: slideIn 0.3s ease; }
    .toast-success { background: #28a745; }
    .toast-error { background: #dc3545; }
    .toast-info { background: #17a2b8; }
    .toast-warning { background: #ffc107; color: #333; }
    .toast-message { flex: 1; margin-right: 0.5rem; }
    .toast-close { background: none; border: none; color: inherit; font-size: 1.25rem; cursor: pointer; padding: 0 0.25rem; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
