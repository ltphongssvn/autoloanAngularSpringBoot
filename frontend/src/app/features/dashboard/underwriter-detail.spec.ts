import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { UnderwriterDetailComponent } from './underwriter-detail';
import { environment } from '../../../environments/environment';

describe('UnderwriterDetailComponent', () => {
  let component: UnderwriterDetailComponent;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/underwriter/applications`;

  const mockLoan = {
    id: 1, applicationNumber: 'APP-001', status: 'IN_REVIEW', loanAmount: 30000,
    downPayment: 6000, loanTerm: 60, vehicleMake: 'Honda', vehicleModel: 'Accord', vehicleYear: 2025
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UnderwriterDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    });
    const fixture = TestBed.createComponent(UnderwriterDetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function flushInit(): void {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);
    httpMock.expectOne(`${apiUrl}/1/documents`).flush([]);
    httpMock.expectOne(`${apiUrl}/1/notes`).flush([]);
    httpMock.expectOne(`${apiUrl}/1/history`).flush([]);
  }

  it('should create and load application, documents, notes, and history', () => {
    flushInit();

    expect(component.loan()?.applicationNumber).toBe('APP-001');
    expect(component.documents().length).toBe(0);
    expect(component.notes().length).toBe(0);
    expect(component.history().length).toBe(0);
  });

  it('should approve application', () => {
    flushInit();

    component.approve();

    const req = httpMock.expectOne(`${apiUrl}/1/approve`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockLoan, status: 'APPROVED' });

    httpMock.expectOne(`${apiUrl}/1/history`).flush([]);

    expect(component.loan()?.status).toBe('APPROVED');
    expect(component.successMessage).toContain('APPROVED');
  });

  it('should request documents', () => {
    flushInit();

    component.requestDocuments();

    const req = httpMock.expectOne(`${apiUrl}/1/request-documents`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockLoan, status: 'DOCUMENTS_REQUESTED' });

    httpMock.expectOne(`${apiUrl}/1/history`).flush([]);

    expect(component.loan()?.status).toBe('DOCUMENTS_REQUESTED');
  });

  it('should add a note', () => {
    flushInit();

    component.newNote = 'Underwriter review note';
    component.noteInternal = true;
    component.addNote();

    const req = httpMock.expectOne(`${apiUrl}/1/notes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ note: 'Underwriter review note', internal: true });
    req.flush({ id: 1, note: 'Underwriter review note', internal: true, applicationId: 1, userId: 5, createdAt: '' });

    expect(component.notes().length).toBe(1);
    expect(component.newNote).toBe('');
  });

  it('should handle action error', () => {
    flushInit();

    component.approve();
    httpMock.expectOne(`${apiUrl}/1/approve`)
      .flush({ message: 'Cannot approve' }, { status: 400, statusText: 'Bad Request' });

    expect(component.errorMessage).toBeTruthy();
    expect(component.actionLoading).toBe(false);
  });
});
