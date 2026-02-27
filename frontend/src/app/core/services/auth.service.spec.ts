import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;
  const testPw = 'pass123'; // pragma: allowlist secret

  const buildAuthResponse = (tok: string, email: string, role: string) => ({
    token: tok, email, firstName: 'Test', lastName: 'User', role, userId: 1, otpRequired: false
  });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should signup and store token', () => {
    const mock = buildAuthResponse('jwt123', 'test@example.com', 'CUSTOMER');
    service.signup({ email: 'test@example.com', password: testPw, firstName: 'Test', lastName: 'User', phone: '555-0001' }).subscribe(res => {
      expect(res.token).toBe('jwt123');
    });
    const req = httpMock.expectOne(`${apiUrl}/signup`);
    expect(req.request.method).toBe('POST');
    req.flush(mock);
    expect(localStorage.getItem('auth_token')).toBe('jwt123');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should login and store token', () => {
    const mock = buildAuthResponse('jwt456', 'test@example.com', 'CUSTOMER');
    service.login({ email: 'test@example.com', password: testPw }).subscribe(res => {
      expect(res.token).toBe('jwt456');
    });
    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush(mock);
    expect(localStorage.getItem('auth_token')).toBe('jwt456');
  });

  it('should not store token when OTP is required', () => {
    const mock = { token: '', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER', userId: 1, otpRequired: true };
    service.login({ email: 'test@example.com', password: testPw }).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush(mock);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should logout and clear storage', () => {
    localStorage.setItem('auth_token', 'jwt123');
    localStorage.setItem('auth_user', '{}');
    service.logout();
    const req = httpMock.expectOne(`${apiUrl}/logout`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Logged out' });
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should return token from storage', () => {
    localStorage.setItem('auth_token', 'stored_val');
    expect(service.getToken()).toBe('stored_val');
  });

  it('should return null when no token stored', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should return user role', () => {
    const mock = buildAuthResponse('jwt_role', 'a@b.com', 'LOAN_OFFICER');
    service.signup({ email: 'a@b.com', password: testPw, firstName: 'A', lastName: 'B', phone: '555' }).subscribe();
    httpMock.expectOne(`${apiUrl}/signup`).flush(mock);
    expect(service.userRole()).toBe('LOAN_OFFICER');
  });

  it('should refresh token', () => {
    const mock = buildAuthResponse('new_jwt', 'test@example.com', 'CUSTOMER');
    service.refresh().subscribe(res => {
      expect(res.token).toBe('new_jwt');
    });
    const req = httpMock.expectOne(`${apiUrl}/refresh`);
    expect(req.request.method).toBe('POST');
    req.flush(mock);
    expect(localStorage.getItem('auth_token')).toBe('new_jwt');
  });

  it('should send forgot password request', () => {
    service.forgotPassword('test@example.com').subscribe(res => {
      expect(res.message).toBe('Reset link sent');
    });
    const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com' });
    req.flush({ message: 'Reset link sent' });
  });

  it('should reset password', () => {
    service.resetPassword('reset_tok', 'new_pw').subscribe(res => {
      expect(res.message).toBe('Password reset successfully');
    });
    const req = httpMock.expectOne(`${apiUrl}/reset-password`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Password reset successfully' });
  });

  it('should confirm email', () => {
    service.confirmEmail('confirm_tok').subscribe(res => {
      expect(res.message).toBe('Email confirmed');
    });
    const req = httpMock.expectOne(r => r.url === `${apiUrl}/confirm-email`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('confirmation_token')).toBe('confirm_tok');
    req.flush({ message: 'Email confirmed' });
  });

  it('should resend confirmation', () => {
    service.resendConfirmation('test@example.com').subscribe(res => {
      expect(res.message).toBe('Confirmation sent');
    });
    const req = httpMock.expectOne(`${apiUrl}/confirm-email`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com' });
    req.flush({ message: 'Confirmation sent' });
  });

  it('should get current user with getMe', () => {
    const mock = buildAuthResponse('jwt_me', 'me@test.com', 'CUSTOMER');
    service.getMe().subscribe(res => {
      expect(res.token).toBe('jwt_me');
    });
    const req = httpMock.expectOne(`${apiUrl}/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
    expect(localStorage.getItem('auth_token')).toBe('jwt_me');
  });
});
