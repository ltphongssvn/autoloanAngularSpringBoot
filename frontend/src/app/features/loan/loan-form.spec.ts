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

  describe('header and navigation', () => {
    it('should create and start on step 1', () => {
      expect(component).toBeTruthy();
      expect(component.step()).toBe(1);
    });

    it('should render all step labels', () => {
      expect(component.steps.map(s => s.label)).toEqual([
        'Personal Info', 'Car Details', 'Loan Details', 'Employment', 'Review'
      ]);
    });

    it('should navigate forward between steps', () => {
      component.next();
      expect(component.step()).toBe(2);
      component.next();
      expect(component.step()).toBe(3);
      component.next();
      expect(component.step()).toBe(4);
      component.next();
      expect(component.step()).toBe(5);
    });

    it('should not go past step 5', () => {
      component.goToStep(5);
      component.next();
      expect(component.step()).toBe(5);
    });

    it('should navigate backward between steps', () => {
      component.goToStep(3);
      component.prev();
      expect(component.step()).toBe(2);
    });

    it('should not go below step 1', () => {
      component.prev();
      expect(component.step()).toBe(1);
    });

    it('should go to specific step via goToStep', () => {
      component.goToStep(4);
      expect(component.step()).toBe(4);
    });
  });

  describe('step 1: Personal Information', () => {
    it('should pre-fill firstName and lastName from auth user', () => {
      expect(component.personalForm.get('firstName')?.value).toBe('John');
      expect(component.personalForm.get('lastName')?.value).toBe('Doe');
    });

    it('should pre-fill email from auth user', () => {
      expect(component.personalForm.get('email')?.value).toBe('test@example.com');
    });

    it('should have all personal info fields', () => {
      const fields = Object.keys(component.personalForm.controls);
      expect(fields).toContain('firstName');
      expect(fields).toContain('lastName');
      expect(fields).toContain('dob');
      expect(fields).toContain('ssn');
      expect(fields).toContain('streetAddress');
      expect(fields).toContain('city');
      expect(fields).toContain('state');
      expect(fields).toContain('zip');
      expect(fields).toContain('yearsAtAddress');
      expect(fields).toContain('monthsAtAddress');
      expect(fields).toContain('phone');
      expect(fields).toContain('email');
    });
  });

  describe('step 2: Vehicle Information', () => {
    it('should have all vehicle fields', () => {
      const fields = Object.keys(component.vehicleForm.controls);
      expect(fields).toContain('vehicleCondition');
      expect(fields).toContain('vehicleMake');
      expect(fields).toContain('vehicleModel');
      expect(fields).toContain('vehicleYear');
      expect(fields).toContain('vehicleTrim');
      expect(fields).toContain('vehicleMileage');
      expect(fields).toContain('vehicleVin');
      expect(fields).toContain('vehicleEstimatedValue');
    });

    it('should default condition to New', () => {
      expect(component.vehicleForm.get('vehicleCondition')?.value).toBe('New');
    });

    it('should have three condition options', () => {
      expect(component.conditions).toEqual(['New', 'Certified Used', 'Used']);
    });

    it('should default year to 2024', () => {
      expect(component.vehicleForm.get('vehicleYear')?.value).toBe(2024);
    });
  });

  describe('step 3: Loan Details', () => {
    it('should calculate LTV correctly', () => {
      component.vehicleForm.patchValue({ vehicleEstimatedValue: 30000 });
      component.loanForm.patchValue({ loanAmount: 25000 });
      expect(component.ltv()).toBe(83);
    });

    it('should show 0% LTV when vehicle value is 0', () => {
      component.vehicleForm.patchValue({ vehicleEstimatedValue: 0 });
      component.loanForm.patchValue({ loanAmount: 25000 });
      expect(component.ltv()).toBe(0);
    });

    it('should show high LTV when loan exceeds value', () => {
      component.vehicleForm.patchValue({ vehicleEstimatedValue: 20000 });
      component.loanForm.patchValue({ loanAmount: 25000 });
      expect(component.ltv()).toBe(125);
    });
  });

  describe('step 4: Employment & Financial Info', () => {
    it('should have all employment fields', () => {
      const fields = Object.keys(component.employmentForm.controls);
      expect(fields).toContain('employer');
      expect(fields).toContain('jobTitle');
      expect(fields).toContain('employmentStatus');
      expect(fields).toContain('yearsAtJob');
      expect(fields).toContain('monthsAtJob');
      expect(fields).toContain('annualIncome');
      expect(fields).toContain('monthlyExpenses');
      expect(fields).toContain('otherIncome');
      expect(fields).toContain('creditScore');
    });

    it('should calculate DTI correctly', () => {
      component.employmentForm.patchValue({ annualIncome: 120000, monthlyExpenses: 3000 });
      expect(component.dti()).toBe(30);
    });

    it('should show 0 DTI when no income', () => {
      component.employmentForm.patchValue({ annualIncome: 0, monthlyExpenses: 3000 });
      expect(component.dti()).toBe(0);
    });

    it('should show high DTI for low income', () => {
      component.employmentForm.patchValue({ annualIncome: 12000, monthlyExpenses: 900 });
      expect(component.dti()).toBe(90);
    });
  });

  describe('step 5: Review', () => {
    it('should have three term options', () => {
      expect(component.termOptions).toEqual([
        { months: 36, rate: 6.5 },
        { months: 48, rate: 6.9 },
        { months: 60, rate: 7.2 }
      ]);
    });

    it('should default to 48 month term', () => {
      expect(component.selectedTerm()).toBe(48);
      expect(component.selectedRate()).toBe(6.9);
    });

    it('should select 36 month term', () => {
      component.selectTerm(36);
      expect(component.selectedTerm()).toBe(36);
      expect(component.selectedRate()).toBe(6.5);
    });

    it('should select 60 month term', () => {
      component.selectTerm(60);
      expect(component.selectedTerm()).toBe(60);
      expect(component.selectedRate()).toBe(7.2);
    });

    it('should calculate monthly payment for term', () => {
      component.loanForm.patchValue({ loanAmount: 25000, downPayment: 5000 });
      const payment = component.monthlyForTerm(48);
      expect(payment).toBeGreaterThan(0);
      expect(payment).toBeLessThan(1000);
    });

    it('should return $0 payment when principal is zero', () => {
      component.loanForm.patchValue({ loanAmount: 5000, downPayment: 5000 });
      expect(component.monthlyForTerm(48)).toBe(0);
    });

    it('should default agreed to false', () => {
      expect(component.agreed()).toBe(false);
    });

    it('should toggle agreed', () => {
      component.agreed.set(true);
      expect(component.agreed()).toBe(true);
    });
  });

  describe('save draft functionality', () => {
    it('should save draft and navigate to loan detail', () => {
      component.vehicleForm.patchValue({ vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024 });
      component.loanForm.patchValue({ loanAmount: 25000, downPayment: 5000 });
      const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      component.saveDraft();
      expect(component.saving()).toBe(true);

      const req = httpMock.expectOne('http://localhost:8080/api/loans');
      expect(req.request.method).toBe('POST');
      req.flush({ id: 10, applicationNumber: 'AL-2026-00010', status: 'DRAFT' });

      expect(component.saving()).toBe(false);
      expect(navSpy).toHaveBeenCalledWith(['/loans', 10]);
    });

    it('should show error on save draft failure', () => {
      component.vehicleForm.patchValue({ vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024 });
      component.loanForm.patchValue({ loanAmount: 25000, downPayment: 5000 });

      component.saveDraft();

      const req = httpMock.expectOne('http://localhost:8080/api/loans');
      req.flush({ message: 'Validation failed' }, { status: 422, statusText: 'Unprocessable Entity' });

      expect(component.saving()).toBe(false);
      expect(component.errorMessage()).toBeTruthy();
    });
  });

  describe('submit functionality', () => {
    it('should create then submit and navigate to dashboard', () => {
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

    it('should navigate to loan detail if submit step fails', () => {
      component.vehicleForm.patchValue({ vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024 });
      component.loanForm.patchValue({ loanAmount: 25000, downPayment: 5000 });
      component.agreed.set(true);
      const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      component.onSubmit();

      const createReq = httpMock.expectOne('http://localhost:8080/api/loans');
      createReq.flush({ id: 1, applicationNumber: 'AL-2026-00001', status: 'DRAFT' });

      const submitReq = httpMock.expectOne('http://localhost:8080/api/loans/1/submit');
      submitReq.flush({ message: 'Failed' }, { status: 500, statusText: 'Error' });

      expect(navSpy).toHaveBeenCalledWith(['/loans', 1]);
    });

    it('should show error if create fails during submit', () => {
      component.vehicleForm.patchValue({ vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024 });
      component.loanForm.patchValue({ loanAmount: 25000, downPayment: 5000 });
      component.agreed.set(true);

      component.onSubmit();

      const req = httpMock.expectOne('http://localhost:8080/api/loans');
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Error' });

      expect(component.saving()).toBe(false);
      expect(component.errorMessage()).toBeTruthy();
    });
  });

  describe('error message clearing', () => {
    it('should clear error on next', () => {
      component.errorMessage.set('some error');
      component.next();
      expect(component.errorMessage()).toBe('');
    });

    it('should clear error on prev', () => {
      component.goToStep(3);
      component.errorMessage.set('some error');
      component.prev();
      expect(component.errorMessage()).toBe('');
    });
  });

  describe('buildPayload', () => {
    it('should include selected term in payload', () => {
      component.selectTerm(60);
      component.vehicleForm.patchValue({ vehicleMake: 'Honda', vehicleModel: 'Civic', vehicleYear: 2023 });
      component.loanForm.patchValue({ loanAmount: 20000, downPayment: 3000 });
      component.agreed.set(true);

      component.saveDraft();

      const req = httpMock.expectOne('http://localhost:8080/api/loans');
      expect(req.request.body.loanTerm).toBe(60);
      expect(req.request.body.vehicleMake).toBe('Honda');
      expect(req.request.body.loanAmount).toBe(20000);
      req.flush({ id: 5, status: 'DRAFT' });
    });
  });
});
