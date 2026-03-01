import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { LoanOfficerDetailComponent } from './loan-officer-detail';
import { environment } from '../../../environments/environment';

describe('LoanOfficerDetailComponent', () => {
  let component: LoanOfficerDetailComponent;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/loan-officer/applications`;

  const mockLoan = {
    id: 1, applicationNumber: 'APP-001', status: 'SUBMITTED', loanAmount: 25000,
    downPayment: 5000, loanTerm: 36, vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoanOfficerDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    });
    const fixture = TestBed.createComponent(LoanOfficerDetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create and load application, notes, and history', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);
    httpMock.expectOne(`${apiUrl}/1/notes`).flush([]);
    httpMock.expectOne(`${apiUrl}/1/history`).flush([]);

    expect(component.loan()?.applicationNumber).toBe('APP-001');
    expect(component.notes().length).toBe(0);
    expect(component.history().length).toBe(0);
  });

  it('should start verification', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);
    httpMock.expectOne(`${apiUrl}/1/notes`).flush([]);
    httpMock.expectOne(`${apiUrl}/1/history`).flush([]);

    component.startVerification();

    const actionReq = httpMock.expectOne(`${apiUrl}/1/start_verification`);
    expect(actionReq.request.method).toBe('POST');
    actionReq.flush({ ...mockLoan, status: 'VERIFYING' });

    httpMock.expectOne(`${apiUrl}/1/history`).flush([]);

    expect(component.loan()?.status).toBe('VERIFYING');
    expect(component.successMessage).toContain('VERIFYING');
  });

  it('should add a note', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);
    httpMock.expectOne(`${apiUrl}/1/notes`).flush([]);
    httpMock.expectOne(`${apiUrl}/1/history`).flush([]);

    component.newNote = 'Test note';
    component.noteInternal = true;
    component.addNote();

    const noteReq = httpMock.expectOne(`${apiUrl}/1/notes`);
    expect(noteReq.request.method).toBe('POST');
    expect(noteReq.request.body).toEqual({ note: 'Test note', internal: true });
    noteReq.flush({ id: 1, note: 'Test note', internal: true, applicationId: 1, userId: 5, createdAt: '' });

    expect(component.notes().length).toBe(1);
    expect(component.newNote).toBe('');
  });

  it('should handle action error', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);
    httpMock.expectOne(`${apiUrl}/1/notes`).flush([]);
    httpMock.expectOne(`${apiUrl}/1/history`).flush([]);

    component.startVerification();
    httpMock.expectOne(`${apiUrl}/1/start_verification`)
      .flush({ message: 'Not allowed' }, { status: 400, statusText: 'Bad Request' });

    expect(component.errorMessage).toBeTruthy();
    expect(component.actionLoading).toBe(false);
  });
});
