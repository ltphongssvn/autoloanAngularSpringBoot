import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DocumentUploadComponent } from './document-upload';
import { environment } from '../../../environments/environment';

describe('DocumentUploadComponent', () => {
  let component: DocumentUploadComponent;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DocumentUploadComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const fixture = TestBed.createComponent(DocumentUploadComponent);
    component = fixture.componentInstance;
    component.applicationId = 1;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create and load documents', () => {
    const mockDocs = [{ id: 1, docType: 'ID', fileName: 'id.pdf', status: 'UPLOADED', applicationId: 1, createdAt: '' }];
    httpMock.expectOne(`${apiUrl}/applications/1/documents`).flush(mockDocs);

    expect(component.documents().length).toBe(1);
  });

  it('should upload a document', () => {
    httpMock.expectOne(`${apiUrl}/applications/1/documents`).flush([]);

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    component.selectedFile = file;
    component.selectedDocType = 'ID';
    component.upload();

    const req = httpMock.expectOne(`${apiUrl}/applications/1/documents`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 2, docType: 'ID', fileName: 'test.pdf', status: 'UPLOADED', applicationId: 1, createdAt: '' });

    expect(component.documents().length).toBe(1);
    expect(component.uploadSuccess).toContain('test.pdf');
    expect(component.selectedFile).toBeNull();
  });

  it('should not upload without file or type', () => {
    httpMock.expectOne(`${apiUrl}/applications/1/documents`).flush([]);

    component.selectedFile = null;
    component.selectedDocType = 'ID';
    component.upload();

    component.selectedFile = new File(['test'], 'test.pdf');
    component.selectedDocType = '';
    component.upload();

    // No additional requests should have been made
  });

  it('should update document status to verified', () => {
    httpMock.expectOne(`${apiUrl}/applications/1/documents`).flush([
      { id: 1, docType: 'ID', fileName: 'id.pdf', status: 'UPLOADED', applicationId: 1, createdAt: '' }
    ]);

    component.updateStatus(1, 'VERIFIED');

    const req = httpMock.expectOne(`${apiUrl}/documents/1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'VERIFIED' });
    req.flush({ id: 1, docType: 'ID', fileName: 'id.pdf', status: 'VERIFIED', applicationId: 1, createdAt: '' });

    expect(component.documents()[0].status).toBe('VERIFIED');
  });

  it('should reject document with comment', () => {
    httpMock.expectOne(`${apiUrl}/applications/1/documents`).flush([
      { id: 1, docType: 'ID', fileName: 'id.pdf', status: 'UPLOADED', applicationId: 1, createdAt: '' }
    ]);

    component.showReject(1);
    expect(component.rejectingId).toBe(1);

    component.rejectComment = 'Blurry image';
    component.updateStatus(1, 'REJECTED');

    const req = httpMock.expectOne(`${apiUrl}/documents/1/status`);
    expect(req.request.body).toEqual({ status: 'REJECTED', comment: 'Blurry image' });
    req.flush({ id: 1, docType: 'ID', fileName: 'id.pdf', status: 'REJECTED', applicationId: 1, createdAt: '' });

    expect(component.documents()[0].status).toBe('REJECTED');
    expect(component.rejectingId).toBe(0);
  });

  it('should delete a document', () => {
    httpMock.expectOne(`${apiUrl}/applications/1/documents`).flush([
      { id: 1, docType: 'ID', fileName: 'id.pdf', status: 'UPLOADED', applicationId: 1, createdAt: '' }
    ]);

    component.remove(1);

    const req = httpMock.expectOne(`${apiUrl}/documents/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(component.documents().length).toBe(0);
  });

  it('should format file sizes', () => {
    httpMock.expectOne(`${apiUrl}/applications/1/documents`).flush([]);

    expect(component.formatSize(500)).toBe('500 B');
    expect(component.formatSize(1536)).toBe('1.5 KB');
    expect(component.formatSize(2097152)).toBe('2.0 MB');
  });
});
