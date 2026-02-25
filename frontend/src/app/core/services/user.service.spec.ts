import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockProfile = {
    id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe',
    phone: '555-1234', role: 'CUSTOMER', signInCount: 3, createdAt: '2026-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should get profile', () => {
    service.getProfile().subscribe(res => {
      expect(res.email).toBe('test@example.com');
    });
    const req = httpMock.expectOne('http://localhost:8080/api/users/me');
    expect(req.request.method).toBe('GET');
    req.flush(mockProfile);
  });

  it('should update profile', () => {
    const update = { firstName: 'Jane', lastName: 'Smith', phone: '555-9999' };
    service.updateProfile(update).subscribe(res => {
      expect(res.firstName).toBe('Jane');
    });
    const req = httpMock.expectOne('http://localhost:8080/api/users/me');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockProfile, ...update });
  });
});
