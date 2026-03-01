// frontend/src/app/features/auth/landing.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LandingComponent } from './landing';

describe('LandingComponent', () => {
  let component: LandingComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [provideRouter([])]
    });
    const fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have brand title', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    const el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    expect(el.textContent).toContain('Auto Loan');
  });

  it('should have hero heading', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    const el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    expect(el.textContent).toContain('Get Your Auto Loan');
  });

  it('should have Apply Now button', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    const el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    const applyBtn = el.querySelector('a[href*="loans/new"], a[href*="signup"]');
    expect(applyBtn).toBeTruthy();
  });

  it('should have Login link', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    const el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    const loginLink = el.querySelector('a[href*="login"]');
    expect(loginLink).toBeTruthy();
  });

  it('should include payment calculator', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    const el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    expect(el.querySelector('app-payment-calculator')).toBeTruthy();
  });
});
