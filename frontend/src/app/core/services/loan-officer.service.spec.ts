import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoanOfficerService } from './loan-officer.service';
import { environment } from '../../../environments/environment';

describe('LoanOfficerService', () => {
  let service: LoanOfficerService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/loan-officer/applications`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LoanOfficerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list applications with no params', () => {
    const mockResponse = { data: [], page: 1, perPage: 20, total: 0, totalPages: 0 };
    service.list().subscribe(res => {
      expect(res.page).toBe(1);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should list applications with params', () => {
    const mockResponse = { data: [], page: 2, perPage: 10, total: 25, totalPages: 3 };
    service.list({ status: 'SUBMITTED', page: 2, perPage: 10, filter: "status eq 'SUBMITTED'", orderby: 'created_at desc' }).subscribe(res => {
      expect(res.total).toBe(25);
    });
    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('status')).toBe('SUBMITTED');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('per_page')).toBe('10');
    expect(req.request.params.get('$filter')).toBe("status eq 'SUBMITTED'");
    expect(req.request.params.get('$orderby')).toBe('created_at desc');
    req.flush(mockResponse);
  });

  it('should get a single application', () => {
    const mockApp = { id: 1, status: 'SUBMITTED' };
    service.get(1).subscribe(app => {
      expect(app.id).toBe(1);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApp);
  });

  it('should start verification', () => {
    service.startVerification(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/start_verification`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should move to review', () => {
    service.review(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/review`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('should request documents', () => {
    service.requestDocuments(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/request_documents`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should approve with request body', () => {
    service.approve(1, { interestRate: 5.5, loanTerm: 36 }).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/approve`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ interestRate: 5.5, loanTerm: 36 });
    req.flush({});
  });

  it('should approve without request body', () => {
    service.approve(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/approve`);
    expect(req.request.body).toEqual({});
    req.flush({});
  });

  it('should reject with reason', () => {
    service.reject(1, 'Insufficient income').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/reject`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ reason: 'Insufficient income' });
    req.flush({});
  });

  it('should get history', () => {
    const mockHistory = [{ id: 1, fromStatus: 'DRAFT', toStatus: 'SUBMITTED', userId: 10, createdAt: '' }];
    service.getHistory(1).subscribe(history => {
      expect(history.length).toBe(1);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/history`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });

  it('should add a note', () => {
    const mockNote = { id: 1, note: 'Test', applicationId: 1, userId: 10, createdAt: '' };
    service.addNote(1, { note: 'Test', internal: false }).subscribe(note => {
      expect(note.note).toBe('Test');
    });
    const req = httpMock.expectOne(`${apiUrl}/1/notes`);
    expect(req.request.method).toBe('POST');
    req.flush(mockNote);
  });

  it('should get notes', () => {
    const mockNotes = [{ id: 1, note: 'Note 1', applicationId: 1, userId: 10, createdAt: '' }];
    service.getNotes(1).subscribe(notes => {
      expect(notes.length).toBe(1);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/notes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockNotes);
  });
});
