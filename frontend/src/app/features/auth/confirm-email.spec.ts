import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ConfirmEmailComponent } from './confirm-email';
import { environment } from '../../../environments/environment';

describe('ConfirmEmailComponent', () => {
  let component: ConfirmEmailComponent;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  function setup(token: string | null, email: string | null = null) {
    TestBed.configureTestingModule({
      imports: [ConfirmEmailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => key === 'confirmation_token' ? token : email
              }
            }
          }
        }
      ]
    });
    const fixture = TestBed.createComponent(ConfirmEmailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }

  afterEach(() => httpMock.verify());

  it('should confirm email with valid token', () => {
    setup('valid_token');

    const req = httpMock.expectOne(r => r.url === `${apiUrl}/confirm-email`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('confirmation_token')).toBe('valid_token');
    req.flush({ message: 'Email confirmed successfully' });

    expect(component.successMessage).toBe('Email confirmed successfully');
    expect(component.loading).toBe(false);
  });

  it('should show error with missing token', () => {
    setup(null);
    expect(component.errorMessage).toBe('Invalid or missing confirmation token.');
  });

  it('should handle confirmation error', () => {
    setup('expired_token');

    httpMock.expectOne(r => r.url === `${apiUrl}/confirm-email`)
      .flush({ message: 'Token expired' }, { status: 400, statusText: 'Bad Request' });

    expect(component.errorMessage).toBe('Token expired');
    expect(component.loading).toBe(false);
  });

  it('should resend confirmation email', () => {
    setup(null, 'test@example.com');

    component.resend();

    const req = httpMock.expectOne(`${apiUrl}/confirm-email`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com' });
    req.flush({ message: 'Confirmation email sent' });

    expect(component.resendSuccess).toBe('Confirmation email sent');
    expect(component.resending).toBe(false);
  });
});
