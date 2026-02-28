// frontend/src/app/features/dashboard/underwriter-detail.ts
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UnderwriterService } from '../../core/services/underwriter.service';
import { StatusHistoryResponse } from '../../core/services/loan-officer.service';
import { LoanApplicationResponse } from '../../core/models/loan.model';
import { DocumentResponse } from '../../core/models/document.model';
import { NoteResponse } from '../../core/models/note.model';

@Component({
  selector: 'app-underwriter-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="uw-layout">
      <header class="header-bar">
        <h2>Financial Analysis</h2>
      </header>

      <div class="uw-content">
        @if (loan()) {
          <div class="top-nav">
            <a routerLink="/dashboard/underwriter" class="back-link">&larr; Back to Dashboard</a>
          </div>
          <div class="title-row">
            <h3>{{ loan()!.applicationNumber }}</h3>
            <span class="tag" [class]="'status-' + loan()!.status.toLowerCase()">{{ formatStatus(loan()!.status) }}</span>
          </div>

          <div class="two-col">
            <!-- Left Column -->
            <div class="col-main">
              <!-- Risk Assessment -->
              <div class="card">
                <h4>RISK ASSESSMENT</h4>
                <div class="risk-item">
                  <div class="risk-row"><span class="risk-label">Debt-to-Income Ratio</span><span>{{ dtiRatio() }}% <span [class]="dtiRatio() < 43 ? 'pass' : 'fail'">{{ dtiRatio() < 43 ? '&#10004;' : '&#10008;' }}</span></span></div>
                  <div class="risk-bar"><div class="risk-fill" [class.good]="dtiRatio() < 43" [class.bad]="dtiRatio() >= 43" [style.width.%]="minVal(dtiRatio(), 100)"></div></div>
                  <span class="risk-target">Target: &lt; 43%</span>
                </div>
                <div class="risk-item">
                  <div class="risk-row"><span class="risk-label">Loan-to-Value Ratio</span><span>{{ ltvRatio() }}% <span [class]="ltvRatio() < 90 ? 'pass' : 'fail'">{{ ltvRatio() < 90 ? '&#10004;' : '&#10008;' }}</span></span></div>
                  <div class="risk-bar"><div class="risk-fill" [class.good]="ltvRatio() < 90" [class.bad]="ltvRatio() >= 90" [style.width.%]="minVal(ltvRatio(), 100)"></div></div>
                  <span class="risk-target">Target: &lt; 90%</span>
                </div>
                <div class="risk-item">
                  <div class="risk-row"><span class="risk-label">Employment Stability</span><span>{{ employmentYears() }} years <span [class]="employmentYears() >= 2 ? 'pass' : 'fail'">{{ employmentYears() >= 2 ? '&#10004;' : '&#10008;' }}</span></span></div>
                  <span class="risk-target">Target: &gt; 2 years</span>
                </div>
                <div class="risk-item">
                  <div class="risk-row"><span class="risk-label">Income Verification</span><span>{{ annualIncome() | currency:'USD':'symbol':'1.0-0' }}/yr <span [class]="annualIncome() > 0 ? 'pass' : 'fail'">{{ annualIncome() > 0 ? '&#10004;' : '&#10008;' }}</span></span></div>
                  <span class="risk-target">Verified</span>
                </div>
              </div>

              <!-- Applicant Summary -->
              <div class="card">
                <h4>APPLICANT SUMMARY</h4>
                <div class="summary-grid">
                  <div>
                    <div class="info-item"><span class="info-label">Name</span><span>{{ loan()!.personalInfo?.['first_name'] || '' }} {{ loan()!.personalInfo?.['last_name'] || '' }}</span></div>
                    <div class="info-item"><span class="info-label">Income</span><span>{{ annualIncome() | currency:'USD':'symbol':'1.0-0' }}/yr</span></div>
                  </div>
                  <div>
                    @if (loan()!.vehicleMake) {
                      <div class="info-item"><span class="info-label">Vehicle</span><span>{{ loan()!.vehicleYear }} {{ loan()!.vehicleMake }} {{ loan()!.vehicleModel }}</span></div>
                    }
                    <div class="info-item"><span class="info-label">Down Payment</span><span>{{ loan()!.downPayment | currency:'USD':'symbol':'1.0-0' }}</span></div>
                  </div>
                </div>
              </div>

              <!-- Documents -->
              <div class="card">
                <h4>Documents</h4>
                @if (documents().length === 0) {
                  <p class="empty">No documents uploaded.</p>
                }
                @for (doc of documents(); track doc.id) {
                  <div class="doc-row">
                    <span>{{ doc.fileName }}</span>
                    <span class="doc-chip">{{ doc.docType }}</span>
                    <span class="doc-chip" [class.doc-verified]="doc.status === 'VERIFIED'">{{ doc.status }}</span>
                  </div>
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
                    @if (entry.comment) { <div class="history-comment">{{ entry.comment }}</div> }
                    <div class="history-meta">{{ entry.createdAt | date:'MMM d, yyyy' }}</div>
                  </div>
                }
              </div>
            </div>

            <!-- Right Column -->
            <div class="col-side">
              <!-- Loan Calculation -->
              <div class="card card-calc">
                <h4>LOAN CALCULATION</h4>
                <div class="calc-rows">
                  <div class="calc-row"><span>Principal:</span><strong>{{ principal() | currency:'USD':'symbol':'1.0-0' }}</strong></div>
                  @if (loan()!.interestRate) {
                    <div class="calc-row"><span>Interest Rate:</span><strong>{{ loan()!.interestRate }}% APR</strong></div>
                  }
                  <div class="calc-row"><span>Term:</span><strong>{{ loan()!.loanTerm }} months</strong></div>
                  @if (loan()!.monthlyPayment) {
                    <div class="calc-row"><span>Monthly Payment:</span><strong>{{ loan()!.monthlyPayment | currency:'USD':'symbol':'1.2-2' }}</strong></div>
                  }
                </div>
              </div>

              <!-- Notes -->
              <div class="card">
                <h4>Internal Notes</h4>
                <textarea [(ngModel)]="newNote" rows="2" placeholder="Add a note..." class="textarea"></textarea>
                <div class="note-controls">
                  <label class="check-label inline" for="noteInternal"><input id="noteInternal" type="checkbox" [(ngModel)]="noteInternal" /> Internal</label>
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
                <h4>UNDERWRITER DECISION</h4>
                @if (loan()!.status === 'IN_REVIEW' || loan()!.status === 'VERIFYING') {
                  <div class="decision-btns">
                    <button class="btn btn-outlined btn-full" (click)="requestDocuments()" [disabled]="actionLoading">&#128196; Request Docs</button>
                    <button class="btn btn-danger btn-full" (click)="showRejectForm = true" [disabled]="actionLoading">Reject</button>
                    <button class="btn btn-success btn-full" (click)="approve()" [disabled]="actionLoading">Approve</button>
                  </div>
                }
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

              @if (errorMessage) { <div class="alert alert-error">{{ errorMessage }}</div> }
              @if (successMessage) { <div class="alert alert-success">{{ successMessage }}</div> }
            </div>
          </div>
        } @else {
          <div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>
        }
      </div>
    </div>
  `,
  styles: [`
    .uw-layout { min-height: 100vh; background: #f5f5f5; }
    .header-bar { background: white; border-bottom: 1px solid #e5e7eb; padding: 0.875rem 2rem; }
    .header-bar h2 { margin: 0; font-size: 1.35rem; color: #333; }
    .uw-content { max-width: 1100px; margin: 0 auto; padding: 1.5rem 1rem; }
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
    .card h4 { margin: 0 0 0.75rem; font-size: 0.95rem; font-weight: 700; color: #1e293b; letter-spacing: 0.03em; }
    .card-calc { background: #e0f2fe; border-color: #bae6fd; }
    .card-decision { background: #fef3c7; border-color: #fde68a; }

    .tag { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 12px; font-weight: 600; }
    .status-draft { background: #f3f4f6; color: #374151; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .status-verifying { background: #d1e7dd; color: #0f5132; }
    .status-in_review { background: #e0e7ff; color: #3730a3; }
    .status-pending_documents { background: #fef9c3; color: #854d0e; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fee2e2; color: #991b1b; }

    .risk-item { margin-bottom: 1rem; }
    .risk-row { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.25rem; }
    .risk-label { font-weight: 600; }
    .risk-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
    .risk-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
    .risk-fill.good { background: #16a34a; }
    .risk-fill.bad { background: #dc2626; }
    .risk-target { font-size: 0.75rem; color: #6b7280; }
    .pass { color: #16a34a; }
    .fail { color: #dc2626; }

    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .info-item { margin-bottom: 0.4rem; font-size: 0.9rem; }
    .info-label { display: block; font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
    .empty { color: #9ca3af; font-style: italic; margin: 0; }

    .doc-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem; }
    .doc-row:last-child { border-bottom: none; }
    .doc-chip { font-size: 0.75rem; padding: 0.15rem 0.5rem; background: #e5e7eb; border-radius: 4px; color: #555; }
    .doc-verified { background: #dcfce7; color: #166534; }

    .calc-rows { display: flex; flex-direction: column; gap: 0.4rem; }
    .calc-row { display: flex; justify-content: space-between; font-size: 0.9rem; }

    .textarea { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.9rem; resize: vertical; box-sizing: border-box; }
    .textarea:focus { outline: none; border-color: #1976d2; }
    .note-controls { display: flex; align-items: center; justify-content: space-between; margin: 0.5rem 0; }
    .check-label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; cursor: pointer; }
    .check-label.inline { display: inline-flex; }
    .check-label input { width: 16px; height: 16px; }
    .note-card { padding: 0.5rem; margin-top: 0.5rem; background: #f9fafb; border-radius: 4px; }
    .note-text { font-size: 0.9rem; }
    .note-meta { font-size: 0.78rem; color: #9ca3af; margin-top: 0.15rem; }

    .decision-btns { display: flex; gap: 0.5rem; }
    .reject-form { margin-top: 0.75rem; }
    .reject-form label { font-size: 0.85rem; font-weight: 500; display: block; margin-bottom: 0.25rem; }
    .reject-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }

    .btn { padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem; cursor: pointer; border: none; font-weight: 500; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: #1976d2; color: white; }
    .btn-success { background: #16a34a; color: white; }
    .btn-success:hover { background: #15803d; }
    .btn-danger { background: #dc2626; color: white; }
    .btn-danger:hover { background: #b91c1c; }
    .btn-outlined { background: white; color: #333; border: 1px solid #d1d5db; }
    .btn-outlined:hover { background: #f3f4f6; }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.85rem; }
    .btn-full { flex: 1; text-align: center; }

    .history-entry { padding: 0.5rem; margin-bottom: 0.4rem; border: 1px solid #f0f0f0; border-radius: 4px; background: #fafafa; }
    .history-transition { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.85rem; }
    .from { color: #6b7280; } .arrow { color: #9ca3af; } .to { color: #1e293b; }
    .history-comment { font-size: 0.8rem; color: #555; font-style: italic; margin-top: 0.15rem; }
    .history-meta { font-size: 0.75rem; color: #9ca3af; }

    .alert { padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; }
    .alert-error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }

    .loading-state { text-align: center; padding: 3rem; }
    .loading-state p { color: #6b7280; margin-top: 1rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e0e0e0; border-top: 3px solid #1976d2; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class UnderwriterDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly underwriterService = inject(UnderwriterService);

  loan = signal<LoanApplicationResponse | null>(null);
  documents = signal<DocumentResponse[]>([]);
  notes = signal<NoteResponse[]>([]);
  history = signal<StatusHistoryResponse[]>([]);

  actionLoading = false;
  errorMessage = '';
  successMessage = '';
  showRejectForm = false;
  rejectReason = '';
  newNote = '';
  noteInternal = false;

  principal = computed(() => (this.loan()?.loanAmount ?? 0) - (this.loan()?.downPayment ?? 0));

  annualIncome = computed(() => {
    const inc = this.loan()?.employmentInfo?.['income'];
    return inc ? +inc : 0;
  });

  employmentYears = computed(() => {
    const yrs = this.loan()?.employmentInfo?.['years'];
    return yrs ? +yrs : 0;
  });

  dtiRatio = computed(() => {
    const mp = this.loan()?.monthlyPayment ?? 0;
    const income = this.annualIncome();
    return income > 0 ? Math.round(((mp * 12) / income) * 100) : 0;
  });

  ltvRatio = computed(() => {
    const price = this.loan()?.carDetails?.['price'] ? +this.loan()!.carDetails!['price'] : 0;
    return price > 0 ? Math.round((this.principal() / price) * 100) : 0;
  });

  minVal(a: number, b: number): number { return Math.min(a, b); }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.underwriterService.get(id).subscribe({
      next: (app) => this.loan.set(app),
      error: () => this.router.navigate(['/dashboard/underwriter'])
    });
    this.underwriterService.getDocuments(id).subscribe({
      next: (d) => this.documents.set(d),
      error: () => this.documents.set([])
    });
    this.underwriterService.getNotes(id).subscribe({
      next: (n) => this.notes.set(n),
      error: () => this.notes.set([])
    });
    this.underwriterService.getHistory(id).subscribe({
      next: (h) => this.history.set(h),
      error: () => this.history.set([])
    });
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  approve(): void {
    this.doAction(() => this.underwriterService.approve(this.loan()!.id));
  }

  reject(): void {
    this.doAction(() => this.underwriterService.reject(this.loan()!.id, this.rejectReason));
    this.showRejectForm = false;
  }

  requestDocuments(): void {
    this.doAction(() => this.underwriterService.requestDocuments(this.loan()!.id));
  }

  addNote(): void {
    const id = this.loan()?.id;
    if (!id || !this.newNote.trim()) return;
    this.underwriterService.addNote(id, { note: this.newNote, internal: this.noteInternal }).subscribe({
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
    this.underwriterService.getHistory(id).subscribe({
      next: (h) => this.history.set(h)
    });
  }
}
