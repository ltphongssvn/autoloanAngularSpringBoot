import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DocumentService } from './document.service';
import { environment } from '../../../environments/environment';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list documents for an application', () => {
    const mockDocs = [{ id: 1, docType: 'ID', fileName: 'id.pdf', status: 'UPLOADED', applicationId: 1, createdAt: '' }];
    service.list(1).subscribe(docs => {
      expect(docs.length).toBe(1);
      expect(docs[0].docType).toBe('ID');
    });
    const req = httpMock.expectOne(`${apiUrl}/applications/1/documents`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDocs);
  });

  it('should get a document by id', () => {
    const mockDoc = { id: 5, docType: 'LICENSE', fileName: 'license.pdf', status: 'VERIFIED', applicationId: 1, createdAt: '' };
    service.get(5).subscribe(doc => {
      expect(doc.id).toBe(5);
      expect(doc.status).toBe('VERIFIED');
    });
    const req = httpMock.expectOne(`${apiUrl}/documents/5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDoc);
  });

  it('should upload a document', () => {
    const mockDoc = { id: 10, docType: 'DRIVERS_LICENSE', fileName: 'dl.pdf', status: 'UPLOADED', applicationId: 1, createdAt: '' };
    const file = new File(['content'], 'dl.pdf', { type: 'application/pdf' });

    service.upload(1, file, 'DRIVERS_LICENSE').subscribe(doc => {
      expect(doc.id).toBe(10);
    });

    const req = httpMock.expectOne(`${apiUrl}/applications/1/documents`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTruthy();
    req.flush(mockDoc);
  });

  it('should delete a document', () => {
    service.delete(3).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/documents/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should download a document', () => {
    service.download(7).subscribe(result => {
      expect(result.url).toBe('https://example.com/file.pdf');
    });

    const req = httpMock.expectOne(`${apiUrl}/documents/7/download`);
    expect(req.request.method).toBe('GET');
    req.flush({ url: 'https://example.com/file.pdf' });
  });

  it('should update document status', () => {
    const mockDoc = { id: 2, docType: 'ID', fileName: 'id.pdf', status: 'VERIFIED', applicationId: 1, createdAt: '' };
    service.updateStatus(2, { status: 'VERIFIED', comment: 'Looks good' }).subscribe(doc => {
      expect(doc.status).toBe('VERIFIED');
    });

    const req = httpMock.expectOne(`${apiUrl}/documents/2/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'VERIFIED', comment: 'Looks good' });
    req.flush(mockDoc);
  });
});
