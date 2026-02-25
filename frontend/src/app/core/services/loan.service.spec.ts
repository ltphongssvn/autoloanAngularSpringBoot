import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoanService } from './loan.service';

describe('LoanService', () => {
  let service: LoanService;
  let httpMock: HttpTestingController;

  const mockLoan = {
    id: 1, applicationNumber: 'APP-123', status: 'DRAFT', currentStep: 1,
    loanAmount: 25000, downPayment: 5000, loanTerm: 36, userId: 1,
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
    vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LoanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create application', () => {
    const request = {
      loanAmount: 25000, downPayment: 5000, loanTerm: 36,
      vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024
    };
    service.createApplication(request).subscribe(res => {
      expect(res.applicationNumber).toBe('APP-123');
    });
    const req = httpMock.expectOne('http://localhost:8080/api/loans');
    expect(req.request.method).toBe('POST');
    req.flush(mockLoan);
  });

  it('should get applications', () => {
    service.getApplications().subscribe(res => {
      expect(res.length).toBe(1);
    });
    const req = httpMock.expectOne('http://localhost:8080/api/loans');
    expect(req.request.method).toBe('GET');
    req.flush([mockLoan]);
  });

  it('should get single application', () => {
    service.getApplication(1).subscribe(res => {
      expect(res.id).toBe(1);
    });
    const req = httpMock.expectOne('http://localhost:8080/api/loans/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockLoan);
  });

  it('should submit application', () => {
    service.submitApplication(1).subscribe(res => {
      expect(res.status).toBe('SUBMITTED');
    });
    const req = httpMock.expectOne('http://localhost:8080/api/loans/1/submit');
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockLoan, status: 'SUBMITTED' });
  });
});
