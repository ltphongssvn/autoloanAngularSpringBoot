import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiKeyResponse, ApiKeyCreateRequest } from '../models/api-key.model';

@Injectable({
  providedIn: 'root'
})
export class ApiKeysService {
  private readonly apiUrl = `${environment.apiUrl}/auth/api-keys`;
  private readonly http = inject(HttpClient);

  list(): Observable<ApiKeyResponse[]> {
    return this.http.get<ApiKeyResponse[]>(this.apiUrl);
  }

  create(request: ApiKeyCreateRequest): Observable<ApiKeyResponse> {
    return this.http.post<ApiKeyResponse>(this.apiUrl, request);
  }

  revoke(id: number): Observable<ApiKeyResponse> {
    return this.http.post<ApiKeyResponse>(`${this.apiUrl}/${id}/revoke`, {});
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
