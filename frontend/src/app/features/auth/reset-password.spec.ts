import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ResetPasswordComponent } from './reset-password';
import { environment } from '../../../environments/environment';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  function setup(token: string | null) {
    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => token } } } }
      ]
    });
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }

  afterEach(() => httpMock.verify());

  it('should create with valid token', () => {
    setup('valid_token');
    expect(component).toBeTruthy();
    expect(component.token).toBe('valid_token');
    expect(component.errorMessage).toBe('');
  });

  it('should show error with missing token', () => {
    setup(null);
    expect(component.errorMessage).toBe('Invalid or missing reset token.');
  });

  it('should not submit with mismatched passwords', () => {
    setup('valid_token');
    component.form.setValue({ password: 'newpass123', confirmPassword: 'different' }); // pragma: allowlist secret
    expect(component.form.hasError('mismatch')).toBe(true);
    component.onSubmit();
    httpMock.expectNone(`${apiUrl}/reset-password`);
  });

  it('should reset password successfully', () => {
    setup('valid_token');
    component.form.setValue({ password: 'newpass123', confirmPassword: 'newpass123' }); // pragma: allowlist secret
    component.onSubmit();

    const req = httpMock.expectOne(`${apiUrl}/reset-password`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Password reset successfully' });

    expect(component.successMessage).toBe('Password reset successfully');
    expect(component.submitting).toBe(false);
  });

  it('should handle reset error', () => {
    setup('expired_token');
    component.form.setValue({ password: 'newpass123', confirmPassword: 'newpass123' }); // pragma: allowlist secret
    component.onSubmit();

    httpMock.expectOne(`${apiUrl}/reset-password`)
      .flush({ message: 'Token expired' }, { status: 400, statusText: 'Bad Request' });

    expect(component.errorMessage).toBe('Token expired');
    expect(component.submitting).toBe(false);
  });
});
