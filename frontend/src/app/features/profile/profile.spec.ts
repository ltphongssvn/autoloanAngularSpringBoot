import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ProfileComponent } from './profile';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let httpMock: HttpTestingController;
  const mockProfile = {
    id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe',
    phone: '555-1234', role: 'CUSTOMER', signInCount: 3, createdAt: '2026-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create and load profile', () => {
    httpMock.expectOne('http://localhost:8080/api/users/me').flush(mockProfile);
    expect(component.profile()?.email).toBe('test@example.com');
    expect(component.form.value.firstName).toBe('John');
  });

  it('should update profile', () => {
    httpMock.expectOne('http://localhost:8080/api/users/me').flush(mockProfile);
    component.form.setValue({ firstName: 'Jane', lastName: 'Smith', phone: '555-9999' });
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/users/me');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockProfile, firstName: 'Jane', lastName: 'Smith', phone: '555-9999' });

    expect(component.profile()?.firstName).toBe('Jane');
    expect(component.successMessage).toBe('Profile updated successfully');
  });

  it('should show error on update failure', () => {
    httpMock.expectOne('http://localhost:8080/api/users/me').flush(mockProfile);
    component.form.setValue({ firstName: 'Jane', lastName: 'Smith', phone: '555-9999' });
    component.onSubmit();
    httpMock.expectOne('http://localhost:8080/api/users/me')
      .flush({ message: 'Update failed' }, { status: 400, statusText: 'Bad Request' });
    expect(component.errorMessage).toBe('Update failed');
  });
});
