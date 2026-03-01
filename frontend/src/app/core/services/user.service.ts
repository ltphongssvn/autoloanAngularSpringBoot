import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile, UserUpdateRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly http = inject(HttpClient);

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }

  updateProfile(request: UserUpdateRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/me`, request);
  }
}
