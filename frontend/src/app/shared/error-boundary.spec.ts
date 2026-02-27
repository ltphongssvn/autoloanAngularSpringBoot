import { TestBed } from '@angular/core/testing';
import { ErrorBoundaryComponent, GlobalErrorHandler } from './error-boundary';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    handler = TestBed.inject(GlobalErrorHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
    expect(handler.errors().length).toBe(0);
    expect(handler.hasError()).toBe(false);
  });

  it('should handle Error objects', () => {
    handler.handleError(new Error('Test failure'));
    expect(handler.errors().length).toBe(1);
    expect(handler.errors()[0].message).toBe('Test failure');
    expect(handler.hasError()).toBe(true);
  });

  it('should handle string errors', () => {
    handler.handleError('Something went wrong');
    expect(handler.errors()[0].message).toBe('Something went wrong');
  });

  it('should keep max 10 errors', () => {
    for (let i = 0; i < 12; i++) {
      handler.handleError(new Error(`Error ${i}`));
    }
    expect(handler.errors().length).toBe(10);
  });

  it('should dismiss an error by id', () => {
    handler.handleError(new Error('A'));
    handler.handleError(new Error('B'));
    const id = handler.errors()[0].id;
    handler.dismiss(id);
    expect(handler.errors().length).toBe(1);
  });

  it('should reset hasError when all dismissed', () => {
    handler.handleError(new Error('Only one'));
    const id = handler.errors()[0].id;
    handler.dismiss(id);
    expect(handler.hasError()).toBe(false);
  });

  it('should clear all errors', () => {
    handler.handleError(new Error('A'));
    handler.handleError(new Error('B'));
    handler.clearAll();
    expect(handler.errors().length).toBe(0);
    expect(handler.hasError()).toBe(false);
  });
});

describe('ErrorBoundaryComponent', () => {
  it('should create and reference error handler', () => {
    TestBed.configureTestingModule({
      imports: [ErrorBoundaryComponent]
    });
    const fixture = TestBed.createComponent(ErrorBoundaryComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.errorHandler).toBeTruthy();
  });
});
