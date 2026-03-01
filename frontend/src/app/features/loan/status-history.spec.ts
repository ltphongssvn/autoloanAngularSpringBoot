import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StatusHistoryComponent } from './status-history';
import { environment } from '../../../environments/environment';

describe('StatusHistoryComponent', () => {
  let component: StatusHistoryComponent;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/loans`;

  const mockHistory = [
    { id: 1, fromStatus: 'DRAFT', toStatus: 'SUBMITTED', userId: 1, createdAt: '2026-01-01' },
    { id: 2, fromStatus: 'SUBMITTED', toStatus: 'VERIFYING', comment: 'Starting review', userId: 5, createdAt: '2026-01-02' },
    { id: 3, fromStatus: 'VERIFYING', toStatus: 'IN_REVIEW', userId: 5, createdAt: '2026-01-03' }
  ];

  describe('with applicationId (auto-fetch)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [StatusHistoryComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()]
      });
      const fixture = TestBed.createComponent(StatusHistoryComponent);
      component = fixture.componentInstance;
      component.applicationId = 1;
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('should load history from API', () => {
      httpMock.expectOne(`${apiUrl}/1/history`).flush(mockHistory);

      expect(component.entries().length).toBe(3);
      expect(component.loading()).toBe(false);
    });

    it('should handle empty history', () => {
      httpMock.expectOne(`${apiUrl}/1/history`).flush([]);

      expect(component.entries().length).toBe(0);
      expect(component.loading()).toBe(false);
    });

    it('should handle fetch error', () => {
      httpMock.expectOne(`${apiUrl}/1/history`)
        .flush('Error', { status: 500, statusText: 'Internal Server Error' });

      expect(component.entries().length).toBe(0);
      expect(component.loading()).toBe(false);
    });
  });

  describe('with external history data', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [StatusHistoryComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()]
      });
      const fixture = TestBed.createComponent(StatusHistoryComponent);
      component = fixture.componentInstance;
      component.history = mockHistory;
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    it('should use provided history without API call', () => {
      expect(component.entries().length).toBe(3);
      expect(component.entries()[1].comment).toBe('Starting review');
      expect(component.loading()).toBe(false);
    });
  });
});
