import { TestBed } from '@angular/core/testing';
import { NotificationBellComponent } from './notification-bell';

describe('NotificationBellComponent', () => {
  let component: NotificationBellComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotificationBellComponent]
    });
    const fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with zero unread count', () => {
    expect(component.unreadCount()).toBe(0);
  });

  it('should toggle dropdown', () => {
    expect(component.showDropdown).toBe(false);
    component.toggle();
    expect(component.showDropdown).toBe(true);
    component.toggle();
    expect(component.showDropdown).toBe(false);
  });

  it('should add notification', () => {
    component.addNotification({ id: 1, message: 'Loan approved', type: 'success', read: false, createdAt: '' });
    expect(component.notifications().length).toBe(1);
    expect(component.unreadCount()).toBe(1);
  });

  it('should mark notification as read', () => {
    component.addNotification({ id: 1, message: 'Test', type: 'info', read: false, createdAt: '' });
    expect(component.unreadCount()).toBe(1);
    component.markAsRead(1);
    expect(component.unreadCount()).toBe(0);
    expect(component.notifications()[0].read).toBe(true);
  });

  it('should mark all as read', () => {
    component.addNotification({ id: 1, message: 'A', type: 'info', read: false, createdAt: '' });
    component.addNotification({ id: 2, message: 'B', type: 'info', read: false, createdAt: '' });
    expect(component.unreadCount()).toBe(2);
    component.markAllAsRead();
    expect(component.unreadCount()).toBe(0);
  });

  it('should clear all notifications', () => {
    component.addNotification({ id: 1, message: 'A', type: 'info', read: false, createdAt: '' });
    component.clearAll();
    expect(component.notifications().length).toBe(0);
  });
});
