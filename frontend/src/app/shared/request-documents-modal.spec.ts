import { TestBed } from '@angular/core/testing';
import { RequestDocumentsModalComponent } from './request-documents-modal';

describe('RequestDocumentsModalComponent', () => {
  let component: RequestDocumentsModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequestDocumentsModalComponent]
    });
    const fixture = TestBed.createComponent(RequestDocumentsModalComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have available doc types', () => {
    expect(component.availableDocTypes.length).toBe(6);
  });

  it('should toggle document type selection', () => {
    component.toggleType('ID');
    expect(component.selectedTypes).toContain('ID');
    component.toggleType('INCOME');
    expect(component.selectedTypes).toEqual(['ID', 'INCOME']);
    component.toggleType('ID');
    expect(component.selectedTypes).toEqual(['INCOME']);
  });

  it('should not submit with no types selected', () => {
    const spy = vi.spyOn(component.submitted, 'emit');
    component.submit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should submit with selected types and message', () => {
    const spy = vi.spyOn(component.submitted, 'emit');
    component.toggleType('ID');
    component.toggleType('BANK_STATEMENT');
    component.message = 'Please upload these documents';
    component.submit();
    expect(spy).toHaveBeenCalledWith({
      docTypes: ['ID', 'BANK_STATEMENT'],
      message: 'Please upload these documents'
    });
    expect(component.selectedTypes).toEqual([]);
    expect(component.message).toBe('');
  });

  it('should emit closed on close', () => {
    const spy = vi.spyOn(component.closed, 'emit');
    component.toggleType('ID');
    component.message = 'test';
    component.close();
    expect(spy).toHaveBeenCalled();
    expect(component.selectedTypes).toEqual([]);
    expect(component.message).toBe('');
  });
});
