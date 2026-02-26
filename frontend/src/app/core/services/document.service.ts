import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentResponse, DocumentStatusUpdateRequest } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly http = inject(HttpClient);

  list(applicationId: number): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.apiUrl}/applications/${applicationId}/documents`);
  }

  get(id: number): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${this.apiUrl}/documents/${id}`);
  }

  upload(applicationId: number, file: File, docType: string): Observable<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    return this.http.post<DocumentResponse>(
      `${this.apiUrl}/applications/${applicationId}/documents`, formData
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documents/${id}`);
  }

  download(id: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/documents/${id}/download`);
  }

  updateStatus(id: number, request: DocumentStatusUpdateRequest): Observable<DocumentResponse> {
    return this.http.patch<DocumentResponse>(`${this.apiUrl}/documents/${id}/status`, request);
  }
}
