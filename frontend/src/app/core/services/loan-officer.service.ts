import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoanApplicationResponse } from '../models/loan.model';
import { NoteResponse, NoteCreateRequest } from '../models/note.model';

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ListParams {
  filter?: string;
  orderby?: string;
  status?: string;
  page?: number;
  perPage?: number;
}

export interface StatusHistoryResponse {
  id: number;
  fromStatus: string;
  toStatus: string;
  comment?: string;
  userId: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoanOfficerService {
  private readonly apiUrl = `${environment.apiUrl}/loan-officer/applications`;
  private readonly http = inject(HttpClient);

  list(params?: ListParams): Observable<PaginatedResponse<LoanApplicationResponse>> {
    let httpParams = new HttpParams();
    if (params?.filter) httpParams = httpParams.set('$filter', params.filter);
    if (params?.orderby) httpParams = httpParams.set('$orderby', params.orderby);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.perPage) httpParams = httpParams.set('per_page', params.perPage.toString());
    return this.http.get<PaginatedResponse<LoanApplicationResponse>>(this.apiUrl, { params: httpParams });
  }

  get(id: number): Observable<LoanApplicationResponse> {
    return this.http.get<LoanApplicationResponse>(`${this.apiUrl}/${id}`);
  }

  startVerification(id: number): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(`${this.apiUrl}/${id}/start_verification`, {});
  }

  review(id: number): Observable<LoanApplicationResponse> {
    return this.http.patch<LoanApplicationResponse>(`${this.apiUrl}/${id}/review`, {});
  }

  requestDocuments(id: number): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(`${this.apiUrl}/${id}/request_documents`, {});
  }

  approve(id: number, request?: { interestRate?: number; loanTerm?: number }): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(`${this.apiUrl}/${id}/approve`, request || {});
  }

  reject(id: number, reason?: string): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  getHistory(id: number): Observable<StatusHistoryResponse[]> {
    return this.http.get<StatusHistoryResponse[]>(`${this.apiUrl}/${id}/history`);
  }

  addNote(id: number, request: NoteCreateRequest): Observable<NoteResponse> {
    return this.http.post<NoteResponse>(`${this.apiUrl}/${id}/notes`, request);
  }

  getNotes(id: number): Observable<NoteResponse[]> {
    return this.http.get<NoteResponse[]>(`${this.apiUrl}/${id}/notes`);
  }
}
