import { TestBed } from '@angular/core/testing';
import { ToastComponent, ToastService } from './toast';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.toasts().length).toBe(0);
  });

  it('should show a toast', () => {
    service.show('Test message', 'info', 0);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Test message');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('should add success toast', () => {
    service.success('Done');
    expect(service.toasts()[0].type).toBe('success');
  });

  it('should add error toast', () => {
    service.error('Failed');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('should add warning toast', () => {
    service.warning('Careful');
    expect(service.toasts()[0].type).toBe('warning');
  });

  it('should dismiss a toast by id', () => {
    service.show('A', 'info', 0);
    service.show('B', 'info', 0);
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('B');
  });

  it('should clear all toasts', () => {
    service.show('A', 'info', 0);
    service.show('B', 'info', 0);
    service.clearAll();
    expect(service.toasts().length).toBe(0);
  });

  it('should auto-dismiss after duration', async () => {
    vi.useFakeTimers();
    service.show('Auto', 'info', 1000);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });
});

describe('ToastComponent', () => {
  it('should create and render toasts', () => {
    TestBed.configureTestingModule({
      imports: [ToastComponent]
    });
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.toastService).toBeTruthy();
  });
});
