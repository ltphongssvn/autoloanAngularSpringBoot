import { TestBed } from '@angular/core/testing';
import { PaymentCalculatorComponent } from './payment-calculator';

describe('PaymentCalculatorComponent', () => {
  let component: PaymentCalculatorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PaymentCalculatorComponent]
    });
    const fixture = TestBed.createComponent(PaymentCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with default values', () => {
    expect(component).toBeTruthy();
    expect(component.loanAmount()).toBe(25000);
    expect(component.downPayment()).toBe(5000);
    expect(component.interestRate()).toBe(5.5);
    expect(component.loanTerm()).toBe(60);
  });

  it('should calculate financed amount', () => {
    expect(component.financedAmount()).toBe(20000);
    component.downPayment.set(10000);
    expect(component.financedAmount()).toBe(15000);
  });

  it('should calculate monthly payment', () => {
    const payment = component.monthlyPayment();
    expect(payment).toBeGreaterThan(0);
    expect(payment).toBeCloseTo(382.02, 0);
  });

  it('should calculate total interest', () => {
    expect(component.totalInterest()).toBeGreaterThan(0);
  });

  it('should calculate total cost', () => {
    expect(component.totalCost()).toBeGreaterThan(component.financedAmount());
  });

  it('should handle zero interest rate', () => {
    component.interestRate.set(0);
    expect(component.monthlyPayment()).toBeCloseTo(333.33, 0);
  });

  it('should handle zero principal', () => {
    component.downPayment.set(25000);
    expect(component.financedAmount()).toBe(0);
    expect(component.monthlyPayment()).toBe(0);
  });

  it('should update when inputs change', () => {
    const initial = component.monthlyPayment();
    component.loanAmount.set(30000);
    expect(component.monthlyPayment()).toBeGreaterThan(initial);
  });
});
