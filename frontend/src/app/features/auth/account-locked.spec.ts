import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AccountLockedComponent } from './account-locked';
import { environment } from '../../../environments/environment';

describe('AccountLockedComponent', () => {
  let component: AccountLockedComponent;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  function setup(unlockToken: string | null, email: string | null = null) {
    TestBed.configureTestingModule({
      imports: [AccountLockedComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => key === 'unlock_token' ? unlockToken : email
              }
            }
          }
        }
      ]
    });
    const fixture = TestBed.createComponent(AccountLockedComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }

  afterEach(() => httpMock.verify());

  it('should create without token', () => {
    setup(null);
    expect(component).toBeTruthy();
    expect(component.unlocking).toBe(false);
  });

  it('should unlock account with valid token', () => {
    setup('valid_unlock_token');

    const req = httpMock.expectOne(r => r.url === `${apiUrl}/unlock`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('unlock_token')).toBe('valid_unlock_token');
    req.flush({ message: 'Account unlocked successfully' });

    expect(component.successMessage).toBe('Account unlocked successfully');
    expect(component.unlocking).toBe(false);
  });

  it('should handle unlock error', () => {
    setup('expired_token');

    httpMock.expectOne(r => r.url === `${apiUrl}/unlock`)
      .flush({ message: 'Token expired' }, { status: 400, statusText: 'Bad Request' });

    expect(component.errorMessage).toBe('Token expired');
    expect(component.unlocking).toBe(false);
  });

  it('should resend unlock email', () => {
    setup(null, 'test@example.com');

    component.resendUnlock();

    const req = httpMock.expectOne(`${apiUrl}/unlock`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com' });
    req.flush({ message: 'Unlock instructions sent' });

    expect(component.resendSuccess).toBe('Unlock instructions sent');
    expect(component.resending).toBe(false);
  });

  it('should show error when resending without email', () => {
    setup(null);
    component.resendUnlock();
    expect(component.errorMessage).toContain('provide your email');
  });
});
