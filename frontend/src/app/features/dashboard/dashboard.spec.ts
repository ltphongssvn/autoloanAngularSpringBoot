import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('auth_user', JSON.stringify({
      token: 'tk', email: 'test@example.com', // pragma: allowlist secret
      firstName: 'John', lastName: 'Doe', role: 'CUSTOMER', userId: 1, otpRequired: false
    }));

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => { httpMock.verify(); localStorage.clear(); });

  it('should create', () => {
    httpMock.expectOne('http://localhost:8080/api/loans').flush([]);
    expect(component).toBeTruthy();
  });

  it('should load applications on init', () => {
    const mockApps = [{
      id: 1, applicationNumber: 'APP-123', status: 'DRAFT', currentStep: 1,
      loanAmount: 25000, downPayment: 5000, loanTerm: 36, userId: 1,
      createdAt: '2026-01-01', updatedAt: '2026-01-01',
      vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024
    }];

    httpMock.expectOne('http://localhost:8080/api/loans').flush({data: {data: mockApps}});
    expect(component.applications().length).toBe(1);
  });

  it('should logout and navigate to login', () => {
    httpMock.expectOne('http://localhost:8080/api/loans').flush([]);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.logout();
    expect(navSpy).toHaveBeenCalledWith(['/login']);
  });
});
