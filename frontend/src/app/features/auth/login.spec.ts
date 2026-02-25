import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should have valid form with correct data', () => {
    component.form.setValue({ email: 'test@example.com', password: 'password123' });
    expect(component.form.valid).toBe(true);
  });

  it('should call login on submit', () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({ email: 'test@example.com', password: 'password123' });
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({
      token: 'jwt', email: 'test@example.com', firstName: 'John',
      lastName: 'Doe', role: 'CUSTOMER', userId: 1, otpRequired: false
    });

    expect(navSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error on login failure', () => {
    component.form.setValue({ email: 'test@example.com', password: 'wrongpass' });
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.loading).toBe(false);
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    httpMock.expectNone('http://localhost:8080/api/auth/login');
  });
});
