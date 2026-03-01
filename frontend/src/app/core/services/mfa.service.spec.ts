import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MfaService } from './mfa.service';
import { environment } from '../../../environments/environment';

describe('MfaService', () => {
  let service: MfaService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth/mfa`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MfaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get MFA status', () => {
    service.status().subscribe(res => {
      expect(res.enabled).toBe(false);
    });
    const req = httpMock.expectOne(`${apiUrl}/status`);
    expect(req.request.method).toBe('GET');
    req.flush({ enabled: false });
  });

  it('should setup MFA', () => {
    const mockSecret = 'JBSWY3DPEHPK3PXP'; // pragma: allowlist secret
    service.setup().subscribe(res => {
      expect(res.secret).toBe(mockSecret);
      expect(res.qrCodeUrl).toContain('otpauth://totp/');
    });
    const req = httpMock.expectOne(`${apiUrl}/setup`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ secret: mockSecret, qrCodeUrl: 'otpauth://totp/app?secret=' + mockSecret }); // pragma: allowlist secret
  });

  it('should enable MFA with code', () => {
    service.enable('123456').subscribe(res => {
      expect(res.enabled).toBe(true);
      expect(res.recoveryCodes?.length).toBe(2);
    });
    const req = httpMock.expectOne(`${apiUrl}/enable`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ code: '123456' });
    req.flush({ enabled: true, recoveryCodes: ['abc', 'def'] });
  });

  it('should disable MFA with code', () => {
    service.disable('654321').subscribe(res => {
      expect(res.enabled).toBe(false);
    });
    const req = httpMock.expectOne(`${apiUrl}/disable`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ code: '654321' });
    req.flush({ enabled: false });
  });

  it('should verify MFA code', () => {
    service.verify('111222').subscribe(res => {
      expect(res.valid).toBe(true);
    });
    const req = httpMock.expectOne(`${apiUrl}/verify`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ code: '111222' });
    req.flush({ valid: true });
  });
});
