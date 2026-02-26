import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoanApplicationRequest, LoanApplicationResponse } from '../models/loan.model';
import { StatusHistoryResponse } from './loan-officer.service';

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

  updateApplication(id: number, request: Partial<LoanApplicationRequest>): Observable<LoanApplicationResponse> {
    return this.http.patch<LoanApplicationResponse>(`${this.apiUrl}/${id}`, request);
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  submitApplication(id: number): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(`${this.apiUrl}/${id}/submit`, {});
  }

  signApplication(id: number, signatureData: string): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(`${this.apiUrl}/${id}/sign`, { signatureData });
  }

  updateStatus(id: number, status: string, comment?: string): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(`${this.apiUrl}/${id}/status`, { status, comment });
  }

  agreementPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/agreement_pdf`, { responseType: 'blob' });
  }

  getHistory(id: number): Observable<StatusHistoryResponse[]> {
    return this.http.get<StatusHistoryResponse[]>(`${this.apiUrl}/${id}/history`);
  }
}
