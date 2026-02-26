import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password';
import { environment } from '../../../environments/environment';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit with invalid email', () => {
    component.form.setValue({ email: 'invalid' });
    component.onSubmit();
    httpMock.expectNone(`${apiUrl}/forgot-password`);
  });

  it('should send forgot password request', () => {
    component.form.setValue({ email: 'test@example.com' });
    component.onSubmit();

    const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com' });
    req.flush({ message: 'Reset link sent to your email' });

    expect(component.successMessage).toBe('Reset link sent to your email');
    expect(component.submitting).toBe(false);
  });

  it('should handle error', () => {
    component.form.setValue({ email: 'test@example.com' });
    component.onSubmit();

    httpMock.expectOne(`${apiUrl}/forgot-password`)
      .flush({ message: 'Email not found' }, { status: 404, statusText: 'Not Found' });

    expect(component.errorMessage).toBe('Email not found');
    expect(component.submitting).toBe(false);
  });
});
