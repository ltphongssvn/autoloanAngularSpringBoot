import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LoanOfficerDashboardComponent } from './loan-officer-dashboard';
import { environment } from '../../../environments/environment';

describe('LoanOfficerDashboardComponent', () => {
  let component: LoanOfficerDashboardComponent;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/loan-officer/applications`;

  const mockResponse = {
    data: [
      { id: 1, applicationNumber: 'APP-001', status: 'SUBMITTED', loanAmount: 25000, vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024 }
    ],
    page: 1, perPage: 20, total: 1, totalPages: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoanOfficerDashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const fixture = TestBed.createComponent(LoanOfficerDashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create and load applications', () => {
    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(component.applications().length).toBe(1);
    expect(component.total()).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should filter by status', () => {
    httpMock.expectOne(r => r.url === apiUrl).flush(mockResponse);

    component.filterByStatus('SUBMITTED');
    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('status')).toBe('SUBMITTED');
    expect(req.request.params.get('page')).toBe('1');
    req.flush(mockResponse);

    expect(component.activeFilter()).toBe('SUBMITTED');
  });

  it('should paginate', () => {
    const multiPageResponse = { ...mockResponse, total: 50, totalPages: 3 };
    httpMock.expectOne(r => r.url === apiUrl).flush(multiPageResponse);

    component.goToPage(2);
    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ ...multiPageResponse, page: 2 });

    expect(component.page()).toBe(2);
  });

  it('should handle error loading applications', () => {
    httpMock.expectOne(r => r.url === apiUrl)
      .flush('Error', { status: 500, statusText: 'Internal Server Error' });

    expect(component.applications().length).toBe(0);
    expect(component.loading()).toBe(false);
  });

  it('should reset page when filtering', () => {
    httpMock.expectOne(r => r.url === apiUrl).flush(mockResponse);

    component.goToPage(3);
    httpMock.expectOne(r => r.url === apiUrl).flush(mockResponse);

    component.filterByStatus('APPROVED');
    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('page')).toBe('1');
    req.flush(mockResponse);

    expect(component.page()).toBe(1);
  });
});
