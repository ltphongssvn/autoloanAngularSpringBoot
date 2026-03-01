import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SettingsComponent } from './settings';
import { environment } from '../../../environments/environment';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let httpMock: HttpTestingController;
  const mfaUrl = `${environment.apiUrl}/auth/mfa`;
  const keysUrl = `${environment.apiUrl}/auth/api-keys`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function flushInit(mfaEnabled = false, keys: unknown[] = []) {
    httpMock.expectOne(`${mfaUrl}/status`).flush({ enabled: mfaEnabled });
    httpMock.expectOne(keysUrl).flush(keys);
  }

  it('should create and load MFA status and API keys', () => {
    flushInit(false, [{ id: 1, name: 'Test Key', active: true, createdAt: '' }]);

    expect(component.mfaEnabled()).toBe(false);
    expect(component.mfaLoading()).toBe(false);
    expect(component.apiKeys().length).toBe(1);
  });

  it('should setup MFA', () => {
    flushInit();

    component.setupMfa();
    const mockSetup = 'JBSWY3DPEHPK3PXP'; // pragma: allowlist secret
    const req = httpMock.expectOne(`${mfaUrl}/setup`);
    expect(req.request.method).toBe('POST');
    req.flush({ secret: mockSetup, qrCodeUrl: 'otpauth://totp/app?secret=' + mockSetup }); // pragma: allowlist secret

    expect(component.setupData()).toBeTruthy();
    expect(component.mfaActioning).toBe(false);
  });

  it('should enable MFA', () => {
    flushInit();

    component.setupData.set({ secret: 'test', qrCodeUrl: 'otpauth://test' }); // pragma: allowlist secret
    component.mfaCode = '123456';
    component.enableMfa();

    const req = httpMock.expectOne(`${mfaUrl}/enable`);
    expect(req.request.body).toEqual({ code: '123456' });
    req.flush({ enabled: true, recoveryCodes: ['abc', 'def'] });

    expect(component.mfaEnabled()).toBe(true);
    expect(component.recoveryCodes().length).toBe(2);
    expect(component.mfaSuccess).toContain('enabled');
  });

  it('should disable MFA', () => {
    flushInit(true);

    component.mfaCode = '654321';
    component.disableMfa();

    const req = httpMock.expectOne(`${mfaUrl}/disable`);
    expect(req.request.body).toEqual({ code: '654321' });
    req.flush({ enabled: false });

    expect(component.mfaEnabled()).toBe(false);
    expect(component.mfaSuccess).toContain('disabled');
  });

  it('should create an API key', () => {
    flushInit();

    component.newKeyName = 'New Key';
    component.createKey();

    const req = httpMock.expectOne(keysUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'New Key' });
    req.flush({ id: 2, name: 'New Key', active: true, key: 'ak_test_123', createdAt: '' });

    expect(component.apiKeys().length).toBe(1);
    expect(component.newKeyValue).toBe('ak_test_123');
    expect(component.newKeyName).toBe('');
  });

  it('should revoke an API key', () => {
    flushInit(false, [{ id: 1, name: 'Key', active: true, createdAt: '' }]);

    component.revokeKey(1);

    const req = httpMock.expectOne(`${keysUrl}/1/revoke`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, name: 'Key', active: false, createdAt: '' });

    expect(component.apiKeys()[0].active).toBe(false);
  });

  it('should remove an API key', () => {
    flushInit(false, [{ id: 1, name: 'Key', active: true, createdAt: '' }]);

    component.removeKey(1);

    const req = httpMock.expectOne(`${keysUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(component.apiKeys().length).toBe(0);
  });
});
