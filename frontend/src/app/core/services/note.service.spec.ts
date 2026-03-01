import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NoteService } from './note.service';
import { environment } from '../../../environments/environment';

describe('NoteService', () => {
  let service: NoteService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(NoteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list notes for an application', () => {
    const mockNotes = [
      { id: 1, note: 'Test note', internal: false, applicationId: 5, userId: 10, createdAt: '' }
    ];

    service.list(5).subscribe(notes => {
      expect(notes.length).toBe(1);
      expect(notes[0].note).toBe('Test note');
    });

    const req = httpMock.expectOne(`${apiUrl}/applications/5/notes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockNotes);
  });

  it('should create a note', () => {
    const mockNote = { id: 2, note: 'New note', internal: true, applicationId: 5, userId: 10, createdAt: '' };

    service.create(5, { note: 'New note', internal: true }).subscribe(note => {
      expect(note.id).toBe(2);
      expect(note.note).toBe('New note');
      expect(note.internal).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/applications/5/notes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ note: 'New note', internal: true });
    req.flush(mockNote);
  });
});
