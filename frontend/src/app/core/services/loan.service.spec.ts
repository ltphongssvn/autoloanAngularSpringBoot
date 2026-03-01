import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoanService } from './loan.service';
import { environment } from '../../../environments/environment';

describe('LoanService', () => {
  let service: LoanService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/loans`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LoanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create an application', () => {
    const mockApp = { id: 1, status: 'DRAFT' };
    const request = { loanAmount: 25000, downPayment: 5000, loanTerm: 36, vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024 };
    service.createApplication(request).subscribe(app => {
      expect(app.id).toBe(1);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockApp);
  });

  it('should get all applications', () => {
    const mockApps = [{ id: 1, status: 'DRAFT' }];
    service.getApplications().subscribe(apps => {
      expect(apps.length).toBe(1);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({data: mockApps});
  });

  it('should get a single application', () => {
    service.getApplication(1).subscribe(app => {
      expect(app.id).toBe(1);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, status: 'DRAFT' });
  });

  it('should update an application', () => {
    service.updateApplication(1, { loanAmount: 30000 }).subscribe(app => {
      expect(app.id).toBe(1);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ loanAmount: 30000 });
    req.flush({ id: 1, status: 'DRAFT' });
  });

  it('should delete an application', () => {
    service.deleteApplication(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should submit an application', () => {
    service.submitApplication(1).subscribe(app => {
      expect(app.status).toBe('SUBMITTED');
    });
    const req = httpMock.expectOne(`${apiUrl}/1/submit`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, status: 'SUBMITTED' });
  });

  it('should sign an application', () => {
    service.signApplication(1, 'base64sig').subscribe(app => {
      expect(app.id).toBe(1);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/sign`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ signatureData: 'base64sig' });
    req.flush({ id: 1, status: 'APPROVED' });
  });

  it('should update status', () => {
    service.updateStatus(1, 'IN_REVIEW', 'Looks good').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/status`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ status: 'IN_REVIEW', comment: 'Looks good' });
    req.flush({ id: 1, status: 'IN_REVIEW' });
  });

  it('should get agreement PDF as blob', () => {
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    service.agreementPdf(1).subscribe(blob => {
      expect(blob.size).toBeGreaterThan(0);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/agreement_pdf`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });

  it('should get application history', () => {
    const mockHistory = [{ id: 1, fromStatus: 'DRAFT', toStatus: 'SUBMITTED', userId: 10, createdAt: '' }];
    service.getHistory(1).subscribe(history => {
      expect(history.length).toBe(1);
      expect(history[0].toStatus).toBe('SUBMITTED');
    });
    const req = httpMock.expectOne(`${apiUrl}/1/history`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });
});
