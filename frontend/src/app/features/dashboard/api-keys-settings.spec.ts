import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ApiKeysSettingsComponent } from './api-keys-settings';
import { environment } from '../../../environments/environment';

describe('ApiKeysSettingsComponent', () => {
  let component: ApiKeysSettingsComponent;
  let httpMock: HttpTestingController;
  const keysUrl = `${environment.apiUrl}/auth/api-keys`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApiKeysSettingsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const fixture = TestBed.createComponent(ApiKeysSettingsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should load API keys on init', () => {
    const mockKeys = [{ id: 1, name: 'Key 1', active: true, createdAt: '' }];
    httpMock.expectOne(keysUrl).flush(mockKeys);

    expect(component.apiKeys().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should handle empty keys', () => {
    httpMock.expectOne(keysUrl).flush([]);

    expect(component.apiKeys().length).toBe(0);
    expect(component.loading()).toBe(false);
  });

  it('should create a key', () => {
    httpMock.expectOne(keysUrl).flush([]);

    component.newKeyName = 'Test Key';
    component.createKey();

    const req = httpMock.expectOne(keysUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Test Key' });
    req.flush({ id: 2, name: 'Test Key', active: true, key: 'ak_new_123', createdAt: '' });

    expect(component.apiKeys().length).toBe(1);
    expect(component.newKeyValue).toBe('ak_new_123');
    expect(component.newKeyName).toBe('');
  });

  it('should create a key with expiry', () => {
    httpMock.expectOne(keysUrl).flush([]);

    component.newKeyName = 'Expiring Key';
    component.newKeyExpiry = '2026-12-31T00:00';
    component.createKey();

    const req = httpMock.expectOne(keysUrl);
    expect(req.request.body.name).toBe('Expiring Key');
    expect(req.request.body.expiresAt).toBeTruthy();
    req.flush({ id: 3, name: 'Expiring Key', active: true, createdAt: '' });
  });

  it('should revoke a key', () => {
    httpMock.expectOne(keysUrl).flush([{ id: 1, name: 'Key', active: true, createdAt: '' }]);

    component.revokeKey(1);

    const req = httpMock.expectOne(`${keysUrl}/1/revoke`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, name: 'Key', active: false, createdAt: '' });

    expect(component.apiKeys()[0].active).toBe(false);
  });

  it('should remove a key', () => {
    httpMock.expectOne(keysUrl).flush([{ id: 1, name: 'Key', active: true, createdAt: '' }]);

    component.removeKey(1);

    const req = httpMock.expectOne(`${keysUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(component.apiKeys().length).toBe(0);
  });

  it('should handle create error', () => {
    httpMock.expectOne(keysUrl).flush([]);

    component.newKeyName = 'Bad Key';
    component.createKey();

    httpMock.expectOne(keysUrl)
      .flush({ message: 'Limit reached' }, { status: 400, statusText: 'Bad Request' });

    expect(component.errorMessage).toBe('Limit reached');
    expect(component.creating).toBe(false);
  });
});
