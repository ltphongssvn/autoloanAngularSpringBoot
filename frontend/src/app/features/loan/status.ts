// frontend/src/app/features/loan/status.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoanService } from '../../core/services/loan.service';
import { LoanApplicationResponse } from '../../core/models/loan.model';
import { StatusHistoryResponse } from '../../core/services/loan-officer.service';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="status-layout">
      <header class="header-bar">
        <h2>Application Status</h2>
      </header>

      <div class="status-content">
        @if (loan()) {
          <div class="top-nav">
            <a [routerLink]="['/loans', loanId]" class="back-link">&larr; Back to Application</a>
          </div>

          <h3 class="app-title">{{ loan()!.applicationNumber }}</h3>

          <!-- Stepper -->
          <div class="card">
            <div class="stepper">
              @for (step of steps; track step; let i = $index) {
                <div class="step" [class.active]="i <= currentStepIndex()" [class.current]="i === currentStepIndex()">
                  <div class="step-circle">{{ i + 1 }}</div>
                  <div class="step-label">{{ step }}</div>
                </div>
                @if (i < steps.length - 1) {
                  <div class="step-line" [class.active]="i < currentStepIndex()"></div>
                }
              }
            </div>

            <div class="status-row">
              <div>
                <span class="meta-label">Current Status</span>
                <span class="tag" [class]="'status-' + loan()!.status.toLowerCase()">{{ formatStatus(loan()!.status) }}</span>
              </div>
              <div class="text-right">
                <span class="meta-label">Last Updated</span>
                <span>{{ loan()!.updatedAt | date:'M/d/yyyy h:mm a' }}</span>
              </div>
            </div>

            @if (getStatusDescription()) {
              <div class="alert alert-info">{{ getStatusDescription() }}</div>
            }
          </div>

          <!-- Rejection -->
          @if (loan()!.rejectionReason) {
            <div class="card rejection-card">
              <h4>Rejection Reason</h4>
              <p>{{ loan()!.rejectionReason }}</p>
            </div>
          }

          <!-- Application Summary -->
          <div class="card">
            <h4>Application Details</h4>
            <div class="detail-rows">
              @if (loan()!.vehicleMake) {
                <div class="detail-row">
                  <span class="detail-label">Vehicle</span>
                  <span>{{ loan()!.vehicleYear }} {{ loan()!.vehicleMake }} {{ loan()!.vehicleModel }}</span>
                </div>
              }
              <div class="detail-row">
                <span class="detail-label">Loan Amount</span>
                <span>{{ loan()!.loanAmount | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Term</span>
                <span>{{ loan()!.loanTerm }} months</span>
              </div>
              @if (loan()!.interestRate) {
                <div class="detail-row">
                  <span class="detail-label">Interest Rate</span>
                  <span>{{ loan()!.interestRate }}% APR</span>
                </div>
              }
              @if (loan()!.monthlyPayment) {
                <div class="detail-row">
                  <span class="detail-label">Monthly Payment</span>
                  <strong>{{ loan()!.monthlyPayment | currency:'USD':'symbol':'1.2-2' }}</strong>
                </div>
              }
            </div>
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
                  <span class="history-icon">&#10004;</span>
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

          <a [routerLink]="['/dashboard']" class="btn btn-outlined">&larr; Back to Dashboard</a>
        } @else {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading...</p>
          </div>
        }

        @if (errorMessage) {
          <div class="alert alert-error">{{ errorMessage }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .status-layout { min-height: 100vh; background: #f5f5f5; }
    .header-bar {
      background: white; border-bottom: 1px solid #e5e7eb;
      padding: 0.875rem 2rem; display: flex; align-items: center;
    }
    .header-bar h2 { margin: 0; font-size: 1.35rem; color: #333; }
    .status-content { max-width: 720px; margin: 0 auto; padding: 1.5rem 1rem; }
    .top-nav { margin-bottom: 0.75rem; }
    .back-link { color: #1976d2; text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { text-decoration: underline; }
    .app-title { margin: 0 0 1.25rem; font-size: 1.25rem; }

    /* Stepper */
    .stepper { display: flex; align-items: center; margin-bottom: 1.5rem; }
    .step { display: flex; flex-direction: column; align-items: center; min-width: 70px; }
    .step-circle {
      width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 600; background: #e5e7eb; color: #9ca3af;
    }
    .step.active .step-circle { background: #1976d2; color: white; }
    .step.current .step-circle { background: #1976d2; color: white; box-shadow: 0 0 0 3px rgba(25,118,210,0.3); }
    .step-label { font-size: 0.7rem; margin-top: 0.35rem; color: #555; text-align: center; }
    .step.active .step-label { color: #1976d2; font-weight: 600; }
    .step-line { flex: 1; height: 2px; background: #e5e7eb; margin: 0 0.25rem; margin-bottom: 1.2rem; }
    .step-line.active { background: #1976d2; }

    .status-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .meta-label { display: block; font-size: 0.78rem; color: #6b7280; margin-bottom: 0.25rem; }
    .text-right { text-align: right; }

    .card {
      background: white; border: 1px solid #e5e7eb; border-radius: 10px;
      padding: 1.25rem; margin-bottom: 1rem;
    }
    .card h4 { margin: 0 0 1rem; font-size: 1rem; color: #1e293b; }

    .tag { font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 12px; font-weight: 600; display: inline-block; }
    .status-draft { background: #f3f4f6; color: #374151; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .status-verifying { background: #d1e7dd; color: #0f5132; }
    .status-in_review { background: #e0e7ff; color: #3730a3; }
    .status-under_review { background: #e0e7ff; color: #3730a3; }
    .status-pending_documents { background: #fef9c3; color: #854d0e; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-signed { background: #d1fae5; color: #065f46; }

    .alert { padding: 0.75rem 1rem; border-radius: 6px; margin-top: 0.75rem; font-size: 0.9rem; }
    .alert-info { background: #e8f4fd; color: #0c5460; border: 1px solid #bee5eb; }
    .alert-error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }

    .detail-rows { display: flex; flex-direction: column; }
    .detail-row {
      display: flex; justify-content: space-between; padding: 0.6rem 0;
      border-bottom: 1px solid #f0f0f0; font-size: 0.9rem;
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6b7280; }

    .rejection-card { border-left: 4px solid #dc2626; }
    .rejection-card p { color: #991b1b; margin: 0; }

    .history-entry {
      padding: 0.75rem; margin-bottom: 0.5rem;
      border: 1px solid #f0f0f0; border-radius: 6px; background: #fafafa;
    }
    .history-transition { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.9rem; }
    .history-icon { color: #16a34a; }
    .from { color: #6b7280; }
    .arrow { color: #9ca3af; }
    .to { color: #1e293b; }
    .history-comment { margin-top: 0.25rem; color: #555; font-style: italic; font-size: 0.85rem; }
    .history-meta { font-size: 0.78rem; color: #9ca3af; margin-top: 0.25rem; }
    .empty { color: #9ca3af; font-style: italic; margin: 0; }

    .btn { display: inline-block; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem; text-decoration: none; font-weight: 500; }
    .btn-outlined { color: #333; border: 1px solid #d1d5db; background: white; }
    .btn-outlined:hover { background: #f3f4f6; }

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
export class StatusComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loanService = inject(LoanService);

  loan = signal<LoanApplicationResponse | null>(null);
  history = signal<StatusHistoryResponse[]>([]);
  loanId = 0;
  errorMessage = '';

  steps = ['Draft', 'Submitted', 'Verifying', 'Under Review', 'Decision'];

  private statusStepMap: Record<string, number> = {
    DRAFT: 0, SUBMITTED: 1, VERIFYING: 2, IN_REVIEW: 3, UNDER_REVIEW: 3,
    PENDING_DOCUMENTS: 2, APPROVED: 4, REJECTED: 4, SIGNED: 4
  };

  currentStepIndex = signal(0);

  ngOnInit(): void {
    this.loanId = Number(this.route.snapshot.paramMap.get('id'));
    this.loanService.getApplication(this.loanId).subscribe({
      next: (app) => {
        this.loan.set(app);
        this.currentStepIndex.set(this.statusStepMap[app.status] ?? 0);
      },
      error: () => this.router.navigate(['/dashboard'])
    });
    this.loanService.getHistory(this.loanId).subscribe({
      next: (h) => this.history.set(h),
      error: () => this.history.set([])
    });
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  getStatusDescription(): string {
    const s = this.loan()?.status;
    switch (s) {
      case 'SUBMITTED': return 'Your application has been submitted and is waiting to be processed.';
      case 'VERIFYING': return 'Intake started. Staff is verifying your initial documents.';
      case 'PENDING_DOCUMENTS': return 'Additional documents are required to continue processing.';
      case 'IN_REVIEW': case 'UNDER_REVIEW': return 'Your application is under full underwriting review.';
      case 'APPROVED': return 'Congratulations! Your loan has been approved.';
      case 'REJECTED': return 'Unfortunately, your application was not approved.';
      default: return '';
    }
  }
}
