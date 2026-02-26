import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MfaStatusResponse, MfaSetupResponse, MfaEnableResponse, MfaVerifyResponse } from '../models/mfa.model';

@Injectable({
  providedIn: 'root'
})
export class MfaService {
  private readonly apiUrl = `${environment.apiUrl}/auth/mfa`;
  private readonly http = inject(HttpClient);

  status(): Observable<MfaStatusResponse> {
    return this.http.get<MfaStatusResponse>(`${this.apiUrl}/status`);
  }

  setup(): Observable<MfaSetupResponse> {
    return this.http.post<MfaSetupResponse>(`${this.apiUrl}/setup`, {});
  }

  enable(code: string): Observable<MfaEnableResponse> {
    return this.http.post<MfaEnableResponse>(`${this.apiUrl}/enable`, { code });
  }

  disable(code: string): Observable<MfaStatusResponse> {
    return this.http.post<MfaStatusResponse>(`${this.apiUrl}/disable`, { code });
  }

  verify(code: string): Observable<MfaVerifyResponse> {
    return this.http.post<MfaVerifyResponse>(`${this.apiUrl}/verify`, { code });
  }
}
