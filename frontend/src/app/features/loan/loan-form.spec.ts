import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { LoanFormComponent } from './loan-form';

describe('LoanFormComponent', () => {
  let component: LoanFormComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('auth_user', JSON.stringify({
      token: 'tk', email: 'test@example.com', // pragma: allowlist secret
      firstName: 'John', lastName: 'Doe', role: 'CUSTOMER', userId: 1, otpRequired: false
    }));

    TestBed.configureTestingModule({
      imports: [LoanFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const fixture = TestBed.createComponent(LoanFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => { httpMock.verify(); localStorage.clear(); });

  it('should create and start on step 1', () => {
    expect(component).toBeTruthy();
    expect(component.step()).toBe(1);
  });

  it('should navigate between steps', () => {
    component.next();
    expect(component.step()).toBe(2);
    component.next();
    expect(component.step()).toBe(3);
    component.prev();
    expect(component.step()).toBe(2);
  });

  it('should go to specific step', () => {
    component.goToStep(4);
    expect(component.step()).toBe(4);
  });

  it('should calculate DTI correctly', () => {
    component.employmentForm.patchValue({ annualIncome: 120000, monthlyExpenses: 3000 });
    expect(component.dti()).toBe(30);
  });

  it('should calculate LTV correctly', () => {
    component.vehicleForm.patchValue({ vehicleEstimatedValue: 40000 });
    component.loanForm.patchValue({ loanAmount: 30000 });
    expect(component.ltv()).toBe(75);
  });

  it('should select term', () => {
    component.selectTerm(36);
    expect(component.selectedTerm()).toBe(36);
    expect(component.selectedRate()).toBe(6.5);
  });

  it('should submit application', () => {
    component.vehicleForm.patchValue({ vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024 });
    component.loanForm.patchValue({ loanAmount: 25000, downPayment: 5000 });
    component.agreed.set(true);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.onSubmit();
    expect(component.saving()).toBe(true);

    const createReq = httpMock.expectOne('http://localhost:8080/api/loans');
    expect(createReq.request.method).toBe('POST');
    createReq.flush({ id: 1, applicationNumber: 'AL-2026-00001', status: 'DRAFT' });

    const submitReq = httpMock.expectOne('http://localhost:8080/api/loans/1/submit');
    expect(submitReq.request.method).toBe('POST');
    submitReq.flush({ id: 1, status: 'SUBMITTED' });

    expect(navSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
