import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AppNotification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bell-container">
      <button class="bell-btn" (click)="toggle()" aria-label="Notifications">
        <span class="bell-icon">🔔</span>
        @if (unreadCount() > 0) {
          <span class="badge">{{ unreadCount() }}</span>
        }
      </button>

      @if (showDropdown) {
        <div class="dropdown">
          <div class="dropdown-header">
            <strong>Notifications</strong>
            @if (unreadCount() > 0) {
              <button class="link-btn" (click)="markAllAsRead()">Mark all read</button>
            }
          </div>

          @if (notifications().length === 0) {
            <div class="empty">No notifications</div>
          }

          @for (n of notifications(); track n.id) {
            <button class="notification-item" [class.unread]="!n.read" [attr.data-type]="n.type" (click)="markAsRead(n.id)">
              <div class="notification-message">{{ n.message }}</div>
              <div class="notification-meta">{{ n.createdAt }}</div>
            </button>
          }

          @if (notifications().length > 0) {
            <div class="dropdown-footer">
              <button class="link-btn" (click)="clearAll()">Clear all</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .bell-container { position: relative; display: inline-block; }
    .bell-btn { background: none; border: none; cursor: pointer; position: relative; font-size: 1.25rem; padding: 0.25rem; }
    .badge { position: absolute; top: -4px; right: -6px; background: #dc3545; color: #fff; font-size: 0.7rem; padding: 0.1rem 0.35rem; border-radius: 50%; min-width: 16px; text-align: center; }
    .dropdown { position: absolute; right: 0; top: 100%; width: 300px; background: #fff; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; max-height: 400px; overflow-y: auto; }
    .dropdown-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid #eee; }
    .notification-item { display: block; width: 100%; text-align: left; padding: 0.75rem; border: none; border-bottom: 1px solid #f0f0f0; cursor: pointer; background: #fff; }
    .notification-item:hover { background: #f8f9fa; }
    .notification-item.unread { background: #f0f7ff; }
    .notification-message { font-size: 0.9rem; }
    .notification-meta { font-size: 0.75rem; color: #999; margin-top: 0.25rem; }
    .dropdown-footer { padding: 0.5rem; text-align: center; border-top: 1px solid #eee; }
    .link-btn { background: none; border: none; color: #007bff; cursor: pointer; font-size: 0.85rem; }
    .link-btn:hover { text-decoration: underline; }
    .empty { padding: 1.5rem; text-align: center; color: #999; }
  `]
})
export class NotificationBellComponent {
  notifications = signal<AppNotification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);
  showDropdown = false;

  toggle(): void {
    this.showDropdown = !this.showDropdown;
  }

  addNotification(notification: AppNotification): void {
    this.notifications.update(current => [notification, ...current]);
  }

  markAsRead(id: number): void {
    this.notifications.update(current =>
      current.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllAsRead(): void {
    this.notifications.update(current =>
      current.map(n => ({ ...n, read: true }))
    );
  }

  clearAll(): void {
    this.notifications.set([]);
    this.showDropdown = false;
  }
}
