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
    TestBed.configureTestingModule({
      imports: [LoanFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const fixture = TestBed.createComponent(LoanFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should have valid form with correct data', () => {
    component.form.setValue({
      loanAmount: 25000, downPayment: 5000, loanTerm: 36,
      vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024,
      vehicleVin: '', vehicleMileage: null, vehicleCondition: ''
    });
    expect(component.form.valid).toBe(true);
  });

  it('should submit and navigate to detail', () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({
      loanAmount: 25000, downPayment: 5000, loanTerm: 36,
      vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024,
      vehicleVin: '', vehicleMileage: null, vehicleCondition: ''
    });
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/loans');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, applicationNumber: 'APP-123', status: 'DRAFT' });

    expect(navSpy).toHaveBeenCalledWith(['/loans', 1]);
  });

  it('should show error on failure', () => {
    component.form.setValue({
      loanAmount: 25000, downPayment: 5000, loanTerm: 36,
      vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024,
      vehicleVin: '', vehicleMileage: null, vehicleCondition: ''
    });
    component.onSubmit();

    httpMock.expectOne('http://localhost:8080/api/loans')
      .flush({ message: 'Error' }, { status: 400, statusText: 'Bad Request' });

    expect(component.errorMessage).toBe('Error');
    expect(component.loading).toBe(false);
  });
});
