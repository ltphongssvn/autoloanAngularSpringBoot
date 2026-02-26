import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoanOfficerService, StatusHistoryResponse } from '../../core/services/loan-officer.service';
import { LoanApplicationResponse } from '../../core/models/loan.model';
import { NoteResponse } from '../../core/models/note.model';

@Component({
  selector: 'app-loan-officer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="detail-container">
      <a routerLink="/dashboard/loan-officer">&larr; Back to Dashboard</a>

      @if (loan()) {
        <h2>Application {{ loan()!.applicationNumber }}</h2>

        <div class="info">
          <div><strong>Status:</strong> <span class="status">{{ loan()!.status }}</span></div>
          <div><strong>Loan Amount:</strong> {{ loan()!.loanAmount | currency }}</div>
          <div><strong>Down Payment:</strong> {{ loan()!.downPayment | currency }}</div>
          <div><strong>Term:</strong> {{ loan()!.loanTerm }} months</div>
          @if (loan()!.interestRate) {
            <div><strong>Interest Rate:</strong> {{ loan()!.interestRate }}%</div>
          }
          @if (loan()!.monthlyPayment) {
            <div><strong>Monthly Payment:</strong> {{ loan()!.monthlyPayment | currency }}</div>
          }
          @if (loan()!.vehicleMake) {
            <div><strong>Vehicle:</strong> {{ loan()!.vehicleYear }} {{ loan()!.vehicleMake }} {{ loan()!.vehicleModel }}</div>
          }
          @if (loan()!.rejectionReason) {
            <div class="rejection"><strong>Rejection Reason:</strong> {{ loan()!.rejectionReason }}</div>
          }
        </div>

        <section class="actions">
          <h3>Actions</h3>
          @if (loan()!.status === 'SUBMITTED') {
            <button (click)="startVerification()" [disabled]="actionLoading">Start Verification</button>
          }
          @if (loan()!.status === 'VERIFYING') {
            <button (click)="moveToReview()" [disabled]="actionLoading">Move to Review</button>
            <button (click)="requestDocuments()" [disabled]="actionLoading">Request Documents</button>
          }
          @if (loan()!.status === 'IN_REVIEW') {
            <button class="approve" (click)="approve()" [disabled]="actionLoading">Approve</button>
            <button class="reject" (click)="showRejectForm = true" [disabled]="actionLoading">Reject</button>
          }
        </section>

        @if (showRejectForm) {
          <section class="reject-form">
            <label for="rejectReason">Rejection Reason:</label>
            <textarea id="rejectReason" [(ngModel)]="rejectReason" rows="3"></textarea>
            <div class="reject-actions">
              <button class="reject" (click)="reject()" [disabled]="actionLoading">Confirm Reject</button>
              <button (click)="showRejectForm = false">Cancel</button>
            </div>
          </section>
        }

        <section class="notes-section">
          <h3>Notes</h3>
          <div class="note-form">
            <label for="newNote" class="sr-only">Add a note</label>
            <textarea id="newNote" [(ngModel)]="newNote" rows="2" placeholder="Add a note..."></textarea>
            <label for="noteInternal"><input id="noteInternal" type="checkbox" [(ngModel)]="noteInternal"> Internal</label>
            <button (click)="addNote()" [disabled]="!newNote.trim()">Add Note</button>
          </div>
          @for (note of notes(); track note.id) {
            <div class="note">
              <div class="note-text">{{ note.note }}</div>
              <div class="note-meta">{{ note.createdAt }}@if (note.internal) { — <em>Internal</em> }</div>
            </div>
          }
        </section>

        <section class="history-section">
          <h3>Status History</h3>
          @for (entry of history(); track entry.id) {
            <div class="history-entry">
              <span>{{ entry.fromStatus }} → {{ entry.toStatus }}</span>
              @if (entry.comment) { <span> — {{ entry.comment }}</span> }
              <div class="history-meta">{{ entry.createdAt }}</div>
            </div>
          }
        </section>
      } @else {
        <p>Loading...</p>
      }

      @if (errorMessage) {
        <div class="error">{{ errorMessage }}</div>
      }
      @if (successMessage) {
        <div class="success">{{ successMessage }}</div>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 700px; margin: 2rem auto; padding: 1rem; }
    .info div { margin-bottom: 0.5rem; }
    .status { padding: 0.2rem 0.5rem; background: #e9ecef; border-radius: 3px; }
    .rejection { color: red; }
    .actions { margin: 1.5rem 0; }
    .actions button { margin-right: 0.5rem; padding: 0.5rem 1rem; cursor: pointer; }
    .approve { background: #28a745; color: #fff; border: none; border-radius: 4px; }
    .reject { background: #dc3545; color: #fff; border: none; border-radius: 4px; }
    .reject-form { margin: 1rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 4px; }
    .reject-form textarea { width: 100%; margin: 0.5rem 0; }
    .reject-actions { display: flex; gap: 0.5rem; }
    .notes-section, .history-section { margin-top: 1.5rem; }
    .note-form { margin-bottom: 1rem; }
    .note-form textarea { width: 100%; margin-bottom: 0.5rem; }
    .note-form label { margin-right: 0.5rem; }
    .note { border: 1px solid #eee; padding: 0.5rem; margin-bottom: 0.5rem; border-radius: 4px; }
    .note-meta { font-size: 0.8rem; color: #666; }
    .history-entry { padding: 0.5rem 0; border-bottom: 1px solid #eee; }
    .history-meta { font-size: 0.8rem; color: #666; }
    .error { color: red; margin-top: 1rem; }
    .success { color: green; margin-top: 1rem; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
    button { padding: 0.5rem 1rem; cursor: pointer; }
    button:disabled { opacity: 0.5; }
  `]
})
export class LoanOfficerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loanOfficerService = inject(LoanOfficerService);

  loan = signal<LoanApplicationResponse | null>(null);
  notes = signal<NoteResponse[]>([]);
  history = signal<StatusHistoryResponse[]>([]);

  actionLoading = false;
  errorMessage = '';
  successMessage = '';
  showRejectForm = false;
  rejectReason = '';
  newNote = '';
  noteInternal = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loanOfficerService.get(id).subscribe({
      next: (app) => this.loan.set(app),
      error: () => this.router.navigate(['/dashboard/loan-officer'])
    });
    this.loanOfficerService.getNotes(id).subscribe({
      next: (n) => this.notes.set(n),
      error: () => this.notes.set([])
    });
    this.loanOfficerService.getHistory(id).subscribe({
      next: (h) => this.history.set(h),
      error: () => this.history.set([])
    });
  }

  startVerification(): void {
    this.doAction(() => this.loanOfficerService.startVerification(this.loan()!.id));
  }

  moveToReview(): void {
    this.doAction(() => this.loanOfficerService.review(this.loan()!.id));
  }

  requestDocuments(): void {
    this.doAction(() => this.loanOfficerService.requestDocuments(this.loan()!.id));
  }

  approve(): void {
    this.doAction(() => this.loanOfficerService.approve(this.loan()!.id));
  }

  reject(): void {
    this.doAction(() => this.loanOfficerService.reject(this.loan()!.id, this.rejectReason));
    this.showRejectForm = false;
  }

  addNote(): void {
    const id = this.loan()?.id;
    if (!id || !this.newNote.trim()) return;
    this.loanOfficerService.addNote(id, { note: this.newNote, internal: this.noteInternal }).subscribe({
      next: (note) => {
        this.notes.update(current => [note, ...current]);
        this.newNote = '';
        this.noteInternal = false;
      },
      error: (err) => this.errorMessage = err.error?.message ?? 'Failed to add note'
    });
  }

  private doAction(action: () => import('rxjs').Observable<LoanApplicationResponse>): void {
    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    action().subscribe({
      next: (app) => {
        this.loan.set(app);
        this.successMessage = `Status updated to ${app.status}`;
        this.actionLoading = false;
        this.refreshHistory();
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Action failed';
        this.actionLoading = false;
      }
    });
  }

  private refreshHistory(): void {
    const id = this.loan()?.id;
    if (!id) return;
    this.loanOfficerService.getHistory(id).subscribe({
      next: (h) => this.history.set(h)
    });
  }
}
