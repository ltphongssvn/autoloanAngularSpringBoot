import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MfaSettingsComponent } from './mfa-settings';
import { environment } from '../../../environments/environment';

describe('MfaSettingsComponent', () => {
  let component: MfaSettingsComponent;
  let httpMock: HttpTestingController;
  const mfaUrl = `${environment.apiUrl}/auth/mfa`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MfaSettingsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const fixture = TestBed.createComponent(MfaSettingsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should load MFA status on init', () => {
    httpMock.expectOne(`${mfaUrl}/status`).flush({ enabled: false });

    expect(component.mfaEnabled()).toBe(false);
    expect(component.loading()).toBe(false);
  });

  it('should show enabled state', () => {
    httpMock.expectOne(`${mfaUrl}/status`).flush({ enabled: true });

    expect(component.mfaEnabled()).toBe(true);
  });

  it('should setup MFA', () => {
    httpMock.expectOne(`${mfaUrl}/status`).flush({ enabled: false });

    component.setupMfa();
    const mockSetupSecret = 'JBSWY3DPEHPK3PXP'; // pragma: allowlist secret
    const req = httpMock.expectOne(`${mfaUrl}/setup`);
    expect(req.request.method).toBe('POST');
    req.flush({ secret: mockSetupSecret, qrCodeUrl: 'otpauth://totp/app' }); // pragma: allowlist secret

    expect(component.setupData()).toBeTruthy();
  });

  it('should enable MFA with code', () => {
    httpMock.expectOne(`${mfaUrl}/status`).flush({ enabled: false });

    component.setupData.set({ secret: 'test', qrCodeUrl: 'otpauth://test' }); // pragma: allowlist secret
    component.code = '123456';
    component.enableMfa();

    const req = httpMock.expectOne(`${mfaUrl}/enable`);
    expect(req.request.body).toEqual({ code: '123456' });
    req.flush({ enabled: true, recoveryCodes: ['rc1', 'rc2'] });

    expect(component.mfaEnabled()).toBe(true);
    expect(component.recoveryCodes().length).toBe(2);
    expect(component.successMessage).toContain('enabled');
  });

  it('should disable MFA with code', () => {
    httpMock.expectOne(`${mfaUrl}/status`).flush({ enabled: true });

    component.code = '654321';
    component.disableMfa();

    const req = httpMock.expectOne(`${mfaUrl}/disable`);
    expect(req.request.body).toEqual({ code: '654321' });
    req.flush({ enabled: false });

    expect(component.mfaEnabled()).toBe(false);
    expect(component.successMessage).toContain('disabled');
  });

  it('should handle enable error', () => {
    httpMock.expectOne(`${mfaUrl}/status`).flush({ enabled: false });

    component.code = '000000';
    component.enableMfa();

    httpMock.expectOne(`${mfaUrl}/enable`)
      .flush({ message: 'Invalid code' }, { status: 400, statusText: 'Bad Request' });

    expect(component.errorMessage).toBe('Invalid code');
  });
});
