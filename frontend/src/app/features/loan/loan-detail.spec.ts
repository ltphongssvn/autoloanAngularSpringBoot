import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { LoanDetailComponent } from './loan-detail';

describe('LoanDetailComponent', () => {
  let component: LoanDetailComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockLoan = {
    id: 1, applicationNumber: 'APP-123', status: 'DRAFT', currentStep: 1,
    loanAmount: 25000, downPayment: 5000, loanTerm: 36, userId: 1,
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
    vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoanDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    });
    const fixture = TestBed.createComponent(LoanDetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create and load loan', () => {
    httpMock.expectOne('http://localhost:8080/api/loans/1').flush(mockLoan);
    expect(component).toBeTruthy();
    expect(component.loan()?.applicationNumber).toBe('APP-123');
  });

  it('should submit application', () => {
    httpMock.expectOne('http://localhost:8080/api/loans/1').flush(mockLoan);

    component.submit();
    const req = httpMock.expectOne('http://localhost:8080/api/loans/1/submit');
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockLoan, status: 'SUBMITTED' });

    expect(component.loan()?.status).toBe('SUBMITTED');
  });

  it('should redirect on load error', () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    httpMock.expectOne('http://localhost:8080/api/loans/1')
      .flush(null, { status: 404, statusText: 'Not Found' });

    expect(navSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
