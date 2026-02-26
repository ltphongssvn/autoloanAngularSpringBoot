import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UnderwriterService } from './underwriter.service';
import { environment } from '../../../environments/environment';

describe('UnderwriterService', () => {
  let service: UnderwriterService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/underwriter/applications`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UnderwriterService);
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
    const mockResponse = { data: [], page: 1, perPage: 10, total: 5, totalPages: 1 };
    service.list({ status: 'IN_REVIEW', page: 1, perPage: 10 }).subscribe(res => {
      expect(res.total).toBe(5);
    });
    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('status')).toBe('IN_REVIEW');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('per_page')).toBe('10');
    req.flush(mockResponse);
  });

  it('should get a single application', () => {
    service.get(1).subscribe(app => {
      expect(app.id).toBe(1);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, status: 'IN_REVIEW' });
  });

  it('should approve with request body', () => {
    service.approve(1, { interestRate: 4.5, loanTerm: 60 }).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/approve`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ interestRate: 4.5, loanTerm: 60 });
    req.flush({});
  });

  it('should approve without request body', () => {
    service.approve(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/approve`);
    expect(req.request.body).toEqual({});
    req.flush({});
  });

  it('should reject with reason', () => {
    service.reject(1, 'Credit score too low').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/reject`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ reason: 'Credit score too low' });
    req.flush({});
  });

  it('should request documents', () => {
    service.requestDocuments(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/request-documents`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should add a note', () => {
    const mockNote = { id: 1, note: 'Underwriter note', applicationId: 1, userId: 5, createdAt: '' };
    service.addNote(1, { note: 'Underwriter note', internal: true }).subscribe(note => {
      expect(note.note).toBe('Underwriter note');
    });
    const req = httpMock.expectOne(`${apiUrl}/1/notes`);
    expect(req.request.method).toBe('POST');
    req.flush(mockNote);
  });

  it('should get notes', () => {
    const mockNotes = [{ id: 1, note: 'Note', applicationId: 1, userId: 5, createdAt: '' }];
    service.getNotes(1).subscribe(notes => {
      expect(notes.length).toBe(1);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/notes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockNotes);
  });

  it('should get documents', () => {
    const mockDocs = [{ id: 1, docType: 'ID', fileName: 'id.pdf', status: 'UPLOADED', applicationId: 1, createdAt: '' }];
    service.getDocuments(1).subscribe(docs => {
      expect(docs.length).toBe(1);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/documents`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDocs);
  });

  it('should get history', () => {
    const mockHistory = [{ id: 1, fromStatus: 'SUBMITTED', toStatus: 'IN_REVIEW', userId: 5, createdAt: '' }];
    service.getHistory(1).subscribe(history => {
      expect(history.length).toBe(1);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/history`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });
});
