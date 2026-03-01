import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { StatusComponent } from './status';
import { environment } from '../../../environments/environment';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/loans`;

  const mockLoan = {
    id: 1, applicationNumber: 'APP-001', status: 'IN_REVIEW', loanAmount: 25000,
    downPayment: 5000, loanTerm: 36, vehicleMake: 'Toyota', vehicleModel: 'Camry', vehicleYear: 2024
  };

  const mockHistory = [
    { id: 1, fromStatus: 'DRAFT', toStatus: 'SUBMITTED', userId: 1, createdAt: '2026-01-01' },
    { id: 2, fromStatus: 'SUBMITTED', toStatus: 'VERIFYING', comment: 'Starting review', userId: 5, createdAt: '2026-01-02' },
    { id: 3, fromStatus: 'VERIFYING', toStatus: 'IN_REVIEW', userId: 5, createdAt: '2026-01-03' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StatusComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    });
    const fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create and load application and history', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);
    httpMock.expectOne(`${apiUrl}/1/history`).flush(mockHistory);

    expect(component.loan()?.applicationNumber).toBe('APP-001');
    expect(component.loan()?.status).toBe('IN_REVIEW');
    expect(component.history().length).toBe(3);
    expect(component.loanId).toBe(1);
  });

  it('should display history entries with comments', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);
    httpMock.expectOne(`${apiUrl}/1/history`).flush(mockHistory);

    expect(component.history()[1].comment).toBe('Starting review');
    expect(component.history()[0].toStatus).toBe('SUBMITTED');
  });

  it('should handle empty history', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);
    httpMock.expectOne(`${apiUrl}/1/history`).flush([]);

    expect(component.history().length).toBe(0);
  });

  it('should handle history load error', () => {
    httpMock.expectOne(`${apiUrl}/1`).flush(mockLoan);
    httpMock.expectOne(`${apiUrl}/1/history`)
      .flush('Error', { status: 500, statusText: 'Internal Server Error' });

    expect(component.history().length).toBe(0);
  });
});
