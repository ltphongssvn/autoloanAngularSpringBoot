import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoanApplicationRequest, LoanApplicationResponse } from '../models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  private readonly apiUrl = `${environment.apiUrl}/loans`;
  private readonly http = inject(HttpClient);

  createApplication(request: LoanApplicationRequest): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(this.apiUrl, request);
  }

  getApplications(): Observable<LoanApplicationResponse[]> {
    return this.http.get<LoanApplicationResponse[]>(this.apiUrl);
  }

  getApplication(id: number): Observable<LoanApplicationResponse> {
    return this.http.get<LoanApplicationResponse>(`${this.apiUrl}/${id}`);
  }

  submitApplication(id: number): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(`${this.apiUrl}/${id}/submit`, {});
  }
}
