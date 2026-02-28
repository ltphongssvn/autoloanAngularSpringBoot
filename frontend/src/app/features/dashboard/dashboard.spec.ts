import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockApps = [
    {
      id: 1, applicationNumber: 'AL-2025-00001', status: 'DRAFT', currentStep: 2,
      loanAmount: 25000, downPayment: 5000, loanTerm: 36, userId: 1,
      createdAt: '2025-12-22T16:19:59Z', updatedAt: '2026-02-25T18:24:39Z',
      vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024
    },
    {
      id: 8, applicationNumber: 'AL-2025-00008', status: 'APPROVED', currentStep: 5,
      loanAmount: 45000, downPayment: 7000, loanTerm: 48, userId: 1,
      createdAt: '2025-12-22T16:19:59Z', updatedAt: '2025-12-22T16:19:59Z',
      vehicleMake: 'Lexus', vehicleModel: 'RX 350', vehicleYear: 2024
    }
  ];

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
    httpMock.expectOne('http://localhost:8080/api/loans').flush({ data: [] });
    expect(component).toBeTruthy();
  });

  it('should load applications on init', () => {
    httpMock.expectOne('http://localhost:8080/api/loans').flush({ data: mockApps });
    expect(component.applications().length).toBe(2);
  });

  it('should filter applications by status', () => {
    httpMock.expectOne('http://localhost:8080/api/loans').flush({ data: mockApps });
    component.statusFilter.set('APPROVED');
    const filtered = component.filteredApplications();
    expect(filtered.length).toBe(1);
    expect(filtered[0].status).toBe('APPROVED');
  });

  it('should sort applications by oldest first', () => {
    httpMock.expectOne('http://localhost:8080/api/loans').flush({ data: mockApps });
    component.sortBy.set('oldest');
    const sorted = component.filteredApplications();
    expect(sorted[0].applicationNumber).toBe('AL-2025-00008');
  });

  it('should format status correctly', () => {
    httpMock.expectOne('http://localhost:8080/api/loans').flush({ data: [] });
    expect(component.formatStatus('UNDER_REVIEW')).toBe('Under Review');
    expect(component.formatStatus('PENDING_DOCUMENTS')).toBe('Pending Documents');
  });

  it('should delete a draft application', () => {
    httpMock.expectOne('http://localhost:8080/api/loans').flush({ data: mockApps });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.deleteApp(1);

    const deleteReq = httpMock.expectOne('http://localhost:8080/api/loans/1');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    expect(component.applications().length).toBe(1);
    expect(component.applications()[0].id).toBe(8);
  });

  it('should not delete if confirm is cancelled', () => {
    httpMock.expectOne('http://localhost:8080/api/loans').flush({ data: mockApps });
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteApp(1);

    expect(component.applications().length).toBe(2);
  });

  it('should logout and navigate to login', () => {
    httpMock.expectOne('http://localhost:8080/api/loans').flush({ data: [] });
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.logout();
    expect(navSpy).toHaveBeenCalledWith(['/login']);
  });
});
