import { TestBed } from '@angular/core/testing';
import { LoadingSkeletonComponent } from './loading-skeleton';

describe('LoadingSkeletonComponent', () => {
  let component: LoadingSkeletonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoadingSkeletonComponent]
    });
    const fixture = TestBed.createComponent(LoadingSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with default text type', () => {
    expect(component).toBeTruthy();
    expect(component.type).toBe('text');
    expect(component.count).toBe(3);
  });

  it('should generate correct number of rows', () => {
    expect(component.rows.length).toBe(3);
    component.count = 5;
    expect(component.rows.length).toBe(5);
  });

  it('should accept card type', () => {
    component.type = 'card';
    expect(component.type).toBe('card');
  });

  it('should accept table type', () => {
    component.type = 'table';
    expect(component.type).toBe('table');
  });

  it('should accept form type', () => {
    component.type = 'form';
    expect(component.type).toBe('form');
  });

  it('should handle count of zero', () => {
    component.count = 0;
    expect(component.rows.length).toBe(0);
  });
});
