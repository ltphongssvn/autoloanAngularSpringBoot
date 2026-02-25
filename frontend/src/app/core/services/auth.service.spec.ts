import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockAuthResponse: AuthResponse = {
    token: 'test-jwt-value', // pragma: allowlist secret
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER',
    userId: 1,
    otpRequired: false
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService
      ]
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
    const request = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-1234'
    };

    service.signup(request).subscribe(response => {
      expect(response.token).toBe('test-jwt-value');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.email).toBe('test@example.com');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/signup');
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);
  });

  it('should login and store token', () => {
    const request = { email: 'test@example.com', password: 'password123' };

    service.login(request).subscribe(response => {
      expect(response.token).toBe('test-jwt-value');
      expect(service.isAuthenticated()).toBe(true);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);
  });

  it('should not store token when OTP required', () => {
    const otpResponse = { ...mockAuthResponse, otpRequired: true };
    const request = { email: 'test@example.com', password: 'password123' };

    service.login(request).subscribe(() => {
      expect(service.isAuthenticated()).toBe(false);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush(otpResponse);
  });

  it('should logout and clear storage', () => {
    localStorage.setItem('auth_token', 'test-jwt-value');
    localStorage.setItem('auth_user', JSON.stringify(mockAuthResponse));

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('should return token from storage', () => {
    localStorage.setItem('auth_token', 'stored-value');
    expect(service.getToken()).toBe('stored-value');
  });

  it('should return null role when not authenticated', () => {
    expect(service.userRole()).toBeNull();
  });
});
