// frontend/src/app/features/dashboard/loan-officer-detail.ts
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
    <div class="review-layout">
      <header class="header-bar">
        <h2>Review Application</h2>
      </header>

      <div class="review-content">
        @if (loan()) {
          <div class="top-nav">
            <a routerLink="/dashboard/loan-officer" class="back-link">&larr; Back to Dashboard</a>
          </div>
          <div class="title-row">
            <h3>{{ loan()!.applicationNumber }}</h3>
            <span class="tag" [class]="'status-' + loan()!.status.toLowerCase()">{{ formatStatus(loan()!.status) }}</span>
          </div>

          <div class="two-col">
            <!-- Left Column: Info Cards -->
            <div class="col-main">
              <!-- Applicant Info -->
              <div class="card card-border-green">
                <h4>Applicant Info</h4>
                @if (loan()!.personalInfo) {
                  <div class="info-grid col3">
                    <div class="info-item"><span class="info-label">Name</span><span>{{ loan()!.personalInfo!['first_name'] }} {{ loan()!.personalInfo!['last_name'] }}</span></div>
                    <div class="info-item"><span class="info-label">DOB</span><span>{{ loan()!.personalInfo!['dob'] || '—' }}</span></div>
                    <div class="info-item"><span class="info-label">Phone</span><span>{{ loan()!.personalInfo!['phone'] || '—' }}</span></div>
                    <div class="info-item"><span class="info-label">Email</span><span>{{ loan()!.personalInfo!['email'] || '—' }}</span></div>
                    @if (loan()!.personalInfo!['address']) {
                      <div class="info-item full"><span class="info-label">Address</span><span>{{ loan()!.personalInfo!['address'] }}, {{ loan()!.personalInfo!['city'] }}, {{ loan()!.personalInfo!['state'] }} {{ loan()!.personalInfo!['zip'] }}</span></div>
                    }
                  </div>
                } @else {
                  <p class="empty">No personal info available.</p>
                }
              </div>

              <!-- Vehicle Info -->
              <div class="card card-border-blue">
                <h4>Vehicle Info</h4>
                <div class="info-grid col3">
                  <div class="info-item"><span class="info-label">Make</span><span>{{ loan()!.vehicleMake || loan()!.carDetails?.['make'] || '—' }}</span></div>
                  <div class="info-item"><span class="info-label">Model</span><span>{{ loan()!.vehicleModel || loan()!.carDetails?.['model'] || '—' }}</span></div>
                  <div class="info-item"><span class="info-label">Year</span><span>{{ loan()!.vehicleYear || loan()!.carDetails?.['year'] || '—' }}</span></div>
                  @if (loan()!.vehicleVin || loan()!.carDetails?.['vin']) {
                    <div class="info-item"><span class="info-label">VIN</span><span>{{ loan()!.vehicleVin || loan()!.carDetails?.['vin'] }}</span></div>
                  }
                  @if (loan()!.carDetails?.['condition']) {
                    <div class="info-item"><span class="info-label">Condition</span><span>{{ loan()!.carDetails!['condition'] }}</span></div>
                  }
                  @if (loan()!.carDetails?.['price']) {
                    <div class="info-item"><span class="info-label">Value</span><span>{{ +loan()!.carDetails!['price'] | currency:'USD':'symbol':'1.0-0' }}</span></div>
                  }
                </div>
              </div>

              <!-- Loan Details -->
              <div class="card card-border-primary">
                <h4>Loan Details</h4>
                <div class="info-grid col3">
                  <div class="info-item"><span class="info-label">Amount</span><span>{{ loan()!.loanAmount | currency:'USD':'symbol':'1.0-0' }}</span></div>
                  <div class="info-item"><span class="info-label">Down</span><span>{{ loan()!.downPayment | currency:'USD':'symbol':'1.0-0' }}</span></div>
                  <div class="info-item"><span class="info-label">Term</span><span>{{ loan()!.loanTerm }} mo</span></div>
                  @if (loan()!.interestRate) {
                    <div class="info-item"><span class="info-label">APR</span><span>{{ loan()!.interestRate }}%</span></div>
                  }
                  @if (loan()!.monthlyPayment) {
                    <div class="info-item"><span class="info-label">Monthly</span><span>{{ loan()!.monthlyPayment | currency:'USD':'symbol':'1.2-2' }}</span></div>
                  }
                </div>
              </div>

              <!-- Employment -->
              <div class="card card-border-red">
                <h4>Employment &amp; Financial</h4>
                @if (loan()!.employmentInfo && loan()!.employmentInfo!['employer']) {
                  <div class="info-grid col3">
                    <div class="info-item"><span class="info-label">Employer</span><span>{{ loan()!.employmentInfo!['employer'] }}</span></div>
                    @if (loan()!.employmentInfo!['job_title']) {
                      <div class="info-item"><span class="info-label">Title</span><span>{{ loan()!.employmentInfo!['job_title'] }}</span></div>
                    }
                    @if (loan()!.employmentInfo!['years']) {
                      <div class="info-item"><span class="info-label">Years</span><span>{{ loan()!.employmentInfo!['years'] }}</span></div>
                    }
                    @if (loan()!.employmentInfo!['income']) {
                      <div class="info-item"><span class="info-label">Income</span><span>{{ +loan()!.employmentInfo!['income'] | currency:'USD':'symbol':'1.0-0' }}/yr</span></div>
                    }
                    @if (loan()!.employmentInfo!['credit_score']) {
                      <div class="info-item"><span class="info-label">Credit Score</span><span>{{ loan()!.employmentInfo!['credit_score'] }}</span></div>
                    }
                  </div>
                } @else {
                  <p class="empty">No employment info available.</p>
                }
              </div>

              <!-- Status History -->
              <div class="card">
                <h4>Status History</h4>
                @if (history().length === 0) {
                  <p class="empty">No status changes recorded.</p>
                }
                @for (entry of history(); track entry.id) {
                  <div class="history-entry">
                    <div class="history-transition">
                      <span class="from">{{ formatStatus(entry.fromStatus) }}</span>
                      <span class="arrow">&rarr;</span>
                      <span class="to">{{ formatStatus(entry.toStatus) }}</span>
                    </div>
                    @if (entry.comment) {
                      <div class="history-comment">{{ entry.comment }}</div>
                    }
                    <div class="history-meta">{{ entry.createdAt | date:'MMM d, yyyy' }}</div>
                  </div>
                }
              </div>
            </div>

            <!-- Right Column: Actions -->
            <div class="col-side">
              <!-- Verification Checklist -->
              <div class="card">
                <h4>Verification Checklist</h4>
                <label class="check-label"><input type="checkbox" [(ngModel)]="checks.ageVerified" /> Applicant 18+</label>
                <label class="check-label"><input type="checkbox" [(ngModel)]="checks.idMatches" /> ID matches</label>
                <label class="check-label"><input type="checkbox" [(ngModel)]="checks.residencyConfirmed" /> Residency confirmed</label>
                <label class="check-label"><input type="checkbox" [(ngModel)]="checks.employmentVerified" /> Employment verified</label>
                <label class="check-label"><input type="checkbox" [(ngModel)]="checks.documentsLegible" /> Documents legible</label>
              </div>

              <!-- Notes -->
              <div class="card">
                <h4>Internal Notes</h4>
                <textarea [(ngModel)]="newNote" rows="2" placeholder="Add a note..." class="textarea"></textarea>
                <div class="note-controls">
                  <label class="check-label inline"><input type="checkbox" [(ngModel)]="noteInternal" /> Internal</label>
                  <button class="btn btn-sm btn-outlined" (click)="addNote()" [disabled]="!newNote.trim()">Add Note</button>
                </div>
                @for (note of notes(); track note.id) {
                  <div class="note-card">
                    <div class="note-text">{{ note.note }}</div>
                    <div class="note-meta">{{ note.createdAt | date:'MMM d, yyyy' }}@if (note.internal) { — <em>Internal</em> }</div>
                  </div>
                }
              </div>

              <!-- Decision Center -->
              <div class="card card-decision">
                <h4>Decision Center</h4>
                <div class="action-buttons">
                  @if (loan()!.status === 'SUBMITTED') {
                    <button class="btn btn-primary btn-full" (click)="startVerification()" [disabled]="actionLoading">Start Verification</button>
                  }
                  @if (loan()!.status === 'VERIFYING') {
                    <button class="btn btn-primary btn-full" (click)="moveToReview()" [disabled]="actionLoading">Forward to Underwriter</button>
                    <button class="btn btn-outlined btn-full" (click)="requestDocuments()" [disabled]="actionLoading">Request Documents</button>
                  }
                  @if (loan()!.status === 'IN_REVIEW') {
                    <button class="btn btn-success btn-full" (click)="approve()" [disabled]="actionLoading">Approve</button>
                    <button class="btn btn-danger btn-full" (click)="showRejectForm = true" [disabled]="actionLoading">Reject</button>
                  }
                </div>
                @if (showRejectForm) {
                  <div class="reject-form">
                    <label for="rejectReason">Rejection Reason:</label>
                    <textarea id="rejectReason" [(ngModel)]="rejectReason" rows="3" class="textarea"></textarea>
                    <div class="reject-actions">
                      <button class="btn btn-danger" (click)="reject()" [disabled]="actionLoading">Confirm Reject</button>
                      <button class="btn btn-outlined" (click)="showRejectForm = false">Cancel</button>
                    </div>
                  </div>
                }
              </div>

              @if (errorMessage) {
                <div class="alert alert-error">{{ errorMessage }}</div>
              }
              @if (successMessage) {
                <div class="alert alert-success">{{ successMessage }}</div>
              }
            </div>
          </div>
        } @else {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading...</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .review-layout { min-height: 100vh; background: #f5f5f5; }
    .header-bar { background: white; border-bottom: 1px solid #e5e7eb; padding: 0.875rem 2rem; }
    .header-bar h2 { margin: 0; font-size: 1.35rem; color: #333; }
    .review-content { max-width: 1100px; margin: 0 auto; padding: 1.5rem 1rem; }
    .top-nav { margin-bottom: 0.75rem; }
    .back-link { color: #1976d2; text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { text-decoration: underline; }
    .title-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
    .title-row h3 { margin: 0; font-size: 1.25rem; }

    .two-col { display: grid; grid-template-columns: 1fr 340px; gap: 1.25rem; }
    @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
    .col-main { display: flex; flex-direction: column; gap: 1rem; }
    .col-side { display: flex; flex-direction: column; gap: 1rem; }

    .card { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem; }
    .card h4 { margin: 0 0 0.75rem; font-size: 1rem; color: #1e293b; }
    .card-border-green { border-left: 4px solid #16a34a; }
    .card-border-blue { border-left: 4px solid #2563eb; }
    .card-border-primary { border-left: 4px solid #1976d2; }
    .card-border-red { border-left: 4px solid #dc2626; }
    .card-decision { background: #fef3c7; border-color: #fde68a; }

    .tag { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 12px; font-weight: 600; }
    .status-draft { background: #f3f4f6; color: #374151; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .status-verifying { background: #d1e7dd; color: #0f5132; }
    .status-in_review { background: #e0e7ff; color: #3730a3; }
    .status-pending_documents { background: #fef9c3; color: #854d0e; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fee2e2; color: #991b1b; }

    .info-grid { display: grid; gap: 0.6rem; }
    .col3 { grid-template-columns: 1fr 1fr 1fr; }
    @media (max-width: 600px) { .col3 { grid-template-columns: 1fr 1fr; } }
    .info-item { display: flex; flex-direction: column; gap: 0.1rem; font-size: 0.9rem; }
    .info-item.full { grid-column: 1 / -1; }
    .info-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.03em; }
    .empty { color: #9ca3af; font-style: italic; margin: 0; }

    .check-label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; margin-bottom: 0.35rem; cursor: pointer; }
    .check-label.inline { display: inline-flex; margin-bottom: 0; }
    .check-label input { width: 16px; height: 16px; }

    .textarea {
      width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;
      font-size: 0.9rem; resize: vertical; box-sizing: border-box;
    }
    .textarea:focus { outline: none; border-color: #1976d2; }
    .note-controls { display: flex; align-items: center; justify-content: space-between; margin: 0.5rem 0; }
    .note-card { padding: 0.5rem; margin-top: 0.5rem; background: #f9fafb; border-radius: 4px; }
    .note-text { font-size: 0.9rem; }
    .note-meta { font-size: 0.78rem; color: #9ca3af; margin-top: 0.15rem; }

    .action-buttons { display: flex; flex-direction: column; gap: 0.5rem; }
    .reject-form { margin-top: 0.75rem; }
    .reject-form label { font-size: 0.85rem; font-weight: 500; display: block; margin-bottom: 0.25rem; }
    .reject-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }

    .btn { padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem; cursor: pointer; border: none; font-weight: 500; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: #1976d2; color: white; }
    .btn-primary:hover { background: #1565c0; }
    .btn-success { background: #16a34a; color: white; }
    .btn-success:hover { background: #15803d; }
    .btn-danger { background: #dc2626; color: white; }
    .btn-danger:hover { background: #b91c1c; }
    .btn-outlined { background: white; color: #333; border: 1px solid #d1d5db; }
    .btn-outlined:hover { background: #f3f4f6; }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.85rem; }
    .btn-full { width: 100%; text-align: center; }

    .history-entry { padding: 0.5rem; margin-bottom: 0.4rem; border: 1px solid #f0f0f0; border-radius: 4px; background: #fafafa; }
    .history-transition { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.85rem; }
    .from { color: #6b7280; }
    .arrow { color: #9ca3af; }
    .to { color: #1e293b; }
    .history-comment { font-size: 0.8rem; color: #555; font-style: italic; margin-top: 0.15rem; }
    .history-meta { font-size: 0.75rem; color: #9ca3af; }

    .alert { padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; }
    .alert-error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }

    .loading-state { text-align: center; padding: 3rem; }
    .loading-state p { color: #6b7280; margin-top: 1rem; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #e0e0e0;
      border-top: 3px solid #1976d2; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
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

  checks = {
    ageVerified: false,
    idMatches: false,
    residencyConfirmed: false,
    employmentVerified: false,
    documentsLegible: false
  };

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

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
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
