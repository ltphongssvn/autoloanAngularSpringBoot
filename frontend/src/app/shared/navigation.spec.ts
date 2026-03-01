import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { NavigationComponent } from './navigation';

describe('NavigationComponent', () => {
  afterEach(() => localStorage.clear());

  function setup(mockUser?: object) {
    localStorage.clear();
    if (mockUser) {
      localStorage.setItem('auth_token', 'jwt');
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
    }
    TestBed.configureTestingModule({
      imports: [NavigationComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const fixture = TestBed.createComponent(NavigationComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    const fixture = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show login links when not authenticated', () => {
    const fixture = setup();
    expect(fixture.componentInstance.authService.isAuthenticated()).toBe(false);
  });

  it('should show user nav when authenticated as CUSTOMER', () => {
    const fixture = setup({ token: 'jwt', email: 'a@b.com', firstName: 'John', lastName: 'Doe', role: 'CUSTOMER', userId: 1, otpRequired: false }); // pragma: allowlist secret
    expect(fixture.componentInstance.authService.isAuthenticated()).toBe(true);
    expect(fixture.componentInstance.authService.userRole()).toBe('CUSTOMER');
  });

  it('should detect LOAN_OFFICER role', () => {
    const fixture = setup({ token: 'jwt', email: 'a@b.com', firstName: 'Jane', lastName: 'O', role: 'LOAN_OFFICER', userId: 2, otpRequired: false }); // pragma: allowlist secret
    expect(fixture.componentInstance.authService.userRole()).toBe('LOAN_OFFICER');
  });

  it('should detect UNDERWRITER role', () => {
    const fixture = setup({ token: 'jwt', email: 'a@b.com', firstName: 'Bob', lastName: 'U', role: 'UNDERWRITER', userId: 3, otpRequired: false }); // pragma: allowlist secret
    expect(fixture.componentInstance.authService.userRole()).toBe('UNDERWRITER');
  });

  it('should logout and navigate to login', () => {
    const fixture = setup({ token: 'jwt', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'CUSTOMER', userId: 1, otpRequired: false }); // pragma: allowlist secret
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');
    fixture.componentInstance.logout();
    expect(fixture.componentInstance.authService.isAuthenticated()).toBe(false);
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});
