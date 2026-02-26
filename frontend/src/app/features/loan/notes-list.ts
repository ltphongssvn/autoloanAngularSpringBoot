import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../core/services/note.service';
import { NoteResponse } from '../../core/models/note.model';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notes-container">
      <h3>Notes</h3>

      @if (showAddForm) {
        <div class="note-form">
          <label for="noteText" class="sr-only">Add a note</label>
          <textarea id="noteText" [(ngModel)]="newNote" rows="3" placeholder="Add a note..."></textarea>
          <div class="note-form-actions">
            <label for="noteInternal"><input id="noteInternal" type="checkbox" [(ngModel)]="isInternal"> Internal note</label>
            <button (click)="addNote()" [disabled]="!newNote.trim() || submitting">
              {{ submitting ? 'Adding...' : 'Add Note' }}
            </button>
          </div>
        </div>
        @if (errorMessage) {
          <div class="error">{{ errorMessage }}</div>
        }
        @if (successMessage) {
          <div class="success">{{ successMessage }}</div>
        }
      }

      <div class="notes-list">
        @if (loading()) {
          <p>Loading notes...</p>
        }

        @if (!loading() && notes().length === 0) {
          <p>No notes yet.</p>
        }

        @for (note of notes(); track note.id) {
          <div class="note-card" [class.internal]="note.internal">
            <div class="note-text">{{ note.note }}</div>
            <div class="note-meta">
              <span>{{ note.createdAt }}</span>
              @if (note.internal) {
                <span class="internal-badge">Internal</span>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .notes-container { margin-top: 1.5rem; }
    .note-form { margin-bottom: 1rem; }
    .note-form textarea { width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; }
    .note-form-actions { display: flex; align-items: center; gap: 1rem; }
    .notes-list { margin-top: 0.5rem; }
    .note-card { border: 1px solid #eee; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 4px; }
    .note-card.internal { border-left: 3px solid #ffc107; background: #fffdf5; }
    .note-text { margin-bottom: 0.25rem; }
    .note-meta { display: flex; gap: 0.5rem; font-size: 0.8rem; color: #666; }
    .internal-badge { background: #ffc107; color: #333; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.75rem; }
    .error { color: red; margin-top: 0.5rem; }
    .success { color: green; margin-top: 0.5rem; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
    button { padding: 0.5rem 1rem; cursor: pointer; }
    button:disabled { opacity: 0.5; }
  `]
})
export class NotesListComponent implements OnInit {
  private readonly noteService = inject(NoteService);

  @Input() applicationId = 0;
  @Input() showAddForm = false;

  notes = signal<NoteResponse[]>([]);
  loading = signal(true);
  newNote = '';
  isInternal = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    if (this.applicationId) {
      this.loadNotes();
    }
  }

  addNote(): void {
    if (!this.newNote.trim()) return;
    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.noteService.create(this.applicationId, { note: this.newNote, internal: this.isInternal }).subscribe({
      next: (note) => {
        this.notes.update(current => [note, ...current]);
        this.newNote = '';
        this.isInternal = false;
        this.successMessage = 'Note added successfully';
        this.submitting = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to add note';
        this.submitting = false;
      }
    });
  }

  private loadNotes(): void {
    this.noteService.list(this.applicationId).subscribe({
      next: (notes) => {
        this.notes.set(notes);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
