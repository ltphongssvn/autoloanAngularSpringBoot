import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AgreementComponent } from './agreement';
import { environment } from '../../../environments/environment';

describe('AgreementComponent', () => {
  let component: AgreementComponent;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/loans`;

  const mockLoan = {
    id: 1, applicationNumber: 'APP-001', status: 'APPROVED', loanAmount: 25000,
    downPayment: 5000, loanTerm: 36, interestRate: 5.5, monthlyPayment: 600,
    vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AgreementComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    });
    const fixture = TestBed.createComponent(AgreementComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create and load application', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);

    expect(component.loan()?.applicationNumber).toBe('APP-001');
    expect(component.loanId).toBe(1);
  });

  it('should download PDF', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);

    component.downloadPdf();

    const req = httpMock.expectOne(`${apiUrl}/1/agreement_pdf`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['pdf'], { type: 'application/pdf' }));

    expect(component.downloading).toBe(false);
  });

  it('should sign agreement', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);

    component.signAgreement();

    const req = httpMock.expectOne(`${apiUrl}/1/sign`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ signatureData: 'electronic-signature' });
    req.flush({ ...mockLoan, status: 'SIGNED' });

    expect(component.loan()?.status).toBe('SIGNED');
    expect(component.successMessage).toContain('signed');
    expect(component.signing).toBe(false);
  });

  it('should handle download error', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);

    component.downloadPdf();
    const errorBlob = new Blob([JSON.stringify({ message: 'Not found' })], { type: 'application/json' });
    httpMock.expectOne(`${apiUrl}/1/agreement_pdf`)
      .flush(errorBlob, { status: 404, statusText: 'Not Found' });

    expect(component.errorMessage).toBeTruthy();
    expect(component.downloading).toBe(false);
  });

  it('should handle sign error', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);

    component.signAgreement();
    httpMock.expectOne(`${apiUrl}/1/sign`)
      .flush({ message: 'Not allowed' }, { status: 400, statusText: 'Bad Request' });

    expect(component.errorMessage).toBeTruthy();
    expect(component.signing).toBe(false);
  });
});
