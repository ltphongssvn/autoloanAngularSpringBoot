import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NoteResponse, NoteCreateRequest } from '../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private readonly apiUrl = `${environment.apiUrl}/applications`;
  private readonly http = inject(HttpClient);

  list(applicationId: number): Observable<NoteResponse[]> {
    return this.http.get<NoteResponse[]>(`${this.apiUrl}/${applicationId}/notes`);
  }

  create(applicationId: number, request: NoteCreateRequest): Observable<NoteResponse> {
    return this.http.post<NoteResponse>(`${this.apiUrl}/${applicationId}/notes`, request);
  }
}
