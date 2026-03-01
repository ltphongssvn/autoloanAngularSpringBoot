import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NotesListComponent } from './notes-list';
import { environment } from '../../../environments/environment';

describe('NotesListComponent', () => {
  let component: NotesListComponent;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/applications`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotesListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const fixture = TestBed.createComponent(NotesListComponent);
    component = fixture.componentInstance;
    component.applicationId = 1;
    component.showAddForm = true;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create and load notes', () => {
    const mockNotes = [
      { id: 1, note: 'First note', applicationId: 1, userId: 5, internal: false, createdAt: '2026-01-01' },
      { id: 2, note: 'Internal note', applicationId: 1, userId: 5, internal: true, createdAt: '2026-01-02' }
    ];
    httpMock.expectOne(`${apiUrl}/1/notes`).flush(mockNotes);

    expect(component.notes().length).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('should handle empty notes', () => {
    httpMock.expectOne(`${apiUrl}/1/notes`).flush([]);

    expect(component.notes().length).toBe(0);
    expect(component.loading()).toBe(false);
  });

  it('should add a note', () => {
    httpMock.expectOne(`${apiUrl}/1/notes`).flush([]);

    component.newNote = 'New test note';
    component.isInternal = true;
    component.addNote();

    const req = httpMock.expectOne(`${apiUrl}/1/notes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ note: 'New test note', internal: true });
    req.flush({ id: 3, note: 'New test note', applicationId: 1, userId: 5, internal: true, createdAt: '' });

    expect(component.notes().length).toBe(1);
    expect(component.newNote).toBe('');
    expect(component.isInternal).toBe(false);
    expect(component.successMessage).toContain('added');
  });

  it('should not add empty note', () => {
    httpMock.expectOne(`${apiUrl}/1/notes`).flush([]);

    component.newNote = '   ';
    component.addNote();

    // No additional POST request
  });

  it('should handle add note error', () => {
    httpMock.expectOne(`${apiUrl}/1/notes`).flush([]);

    component.newNote = 'Test note';
    component.addNote();

    httpMock.expectOne(`${apiUrl}/1/notes`)
      .flush({ message: 'Unauthorized' }, { status: 403, statusText: 'Forbidden' });

    expect(component.errorMessage).toBe('Unauthorized');
    expect(component.submitting).toBe(false);
  });
});
