import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { SignupComponent } from './signup';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    const fixture = TestBed.createComponent(SignupComponent);
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
    component.form.setValue({
      firstName: 'John', lastName: 'Doe',
      email: 'test@example.com', phone: '555-1234', password: 'password123'
    });
    expect(component.form.valid).toBe(true);
  });

  it('should call signup on submit', () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({
      firstName: 'John', lastName: 'Doe',
      email: 'test@example.com', phone: '555-1234', password: 'password123'
    });
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/signup');
    expect(req.request.method).toBe('POST');
    req.flush({
      token: 'jwt', email: 'test@example.com', firstName: 'John',
      lastName: 'Doe', role: 'CUSTOMER', userId: 1, otpRequired: false
    });

    expect(navSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error on signup failure', () => {
    component.form.setValue({
      firstName: 'John', lastName: 'Doe',
      email: 'test@example.com', phone: '555-1234', password: 'password123'
    });
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/signup');
    req.flush({ message: 'Email already registered' }, { status: 400, statusText: 'Bad Request' });

    expect(component.errorMessage).toBe('Email already registered');
    expect(component.loading).toBe(false);
  });
});
