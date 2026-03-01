import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiKeysService } from './api-keys.service';
import { environment } from '../../../environments/environment';

describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth/api-keys`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ApiKeysService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list api keys', () => {
    const mockKeys = [
      { id: 1, name: 'My Key', active: true, createdAt: '' },
      { id: 2, name: 'Old Key', active: false, createdAt: '' }
    ];
    service.list().subscribe(keys => {
      expect(keys.length).toBe(2);
      expect(keys[0].name).toBe('My Key');
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockKeys);
  });

  it('should create an api key', () => {
    const mockKey = { id: 3, name: 'New Key', active: true, key: 'ak_test_123', createdAt: '' };
    service.create({ name: 'New Key' }).subscribe(key => {
      expect(key.id).toBe(3);
      expect(key.key).toBe('ak_test_123');
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'New Key' });
    req.flush(mockKey);
  });

  it('should create an api key with expiration', () => {
    const mockKey = { id: 4, name: 'Expiring Key', active: true, expiresAt: '2026-12-31T00:00:00Z', createdAt: '' };
    service.create({ name: 'Expiring Key', expiresAt: '2026-12-31T00:00:00Z' }).subscribe(key => {
      expect(key.expiresAt).toBe('2026-12-31T00:00:00Z');
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.body).toEqual({ name: 'Expiring Key', expiresAt: '2026-12-31T00:00:00Z' });
    req.flush(mockKey);
  });

  it('should revoke an api key', () => {
    const mockKey = { id: 1, name: 'My Key', active: false, createdAt: '' };
    service.revoke(1).subscribe(key => {
      expect(key.active).toBe(false);
    });
    const req = httpMock.expectOne(`${apiUrl}/1/revoke`);
    expect(req.request.method).toBe('POST');
    req.flush(mockKey);
  });

  it('should remove an api key', () => {
    service.remove(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
