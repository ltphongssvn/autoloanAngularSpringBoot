import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoanService } from '../../core/services/loan.service';
import { LoanApplicationResponse } from '../../core/models/loan.model';

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-container">
      <div class="detail-header">
        <a routerLink="/dashboard" class="back-link">&larr; Back to Dashboard</a>
      </div>

      @if (loan()) {
        <div class="title-row">
          <h2>Application {{ loan()!.applicationNumber }}</h2>
          <span class="tag" [class]="'status-' + loan()!.status.toLowerCase()">{{ formatStatus(loan()!.status) }}</span>
        </div>

        @if (loan()!.status === 'DRAFT') {
          <div class="incomplete-banner">
            <span>&#9888;</span> This application is incomplete. Fill in the required information and submit.
          </div>
        }

        <!-- Vehicle Card -->
        <div class="card">
          <h3>Vehicle Information</h3>
          @if (loan()!.vehicleMake) {
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Vehicle</span>
                <span class="info-value">{{ loan()!.vehicleYear }} {{ loan()!.vehicleMake }} {{ loan()!.vehicleModel }}</span>
              </div>
              @if (loan()!.vehicleTrim) {
                <div class="info-item">
                  <span class="info-label">Trim</span>
                  <span class="info-value">{{ loan()!.vehicleTrim }}</span>
                </div>
              }
              @if (loan()!.vehicleVin) {
                <div class="info-item">
                  <span class="info-label">VIN</span>
                  <span class="info-value">{{ loan()!.vehicleVin }}</span>
                </div>
              }
            </div>
          } @else {
            <p class="empty">No vehicle information provided yet.</p>
          }
        </div>

        <!-- Loan Details Card -->
        <div class="card">
          <h3>Loan Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Loan Amount</span>
              <span class="info-value">{{ loan()!.loanAmount | currency:'USD':'symbol':'1.2-2' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Down Payment</span>
              <span class="info-value">{{ loan()!.downPayment | currency:'USD':'symbol':'1.2-2' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Term</span>
              <span class="info-value">{{ loan()!.loanTerm }} months</span>
            </div>
            @if (loan()!.interestRate) {
              <div class="info-item">
                <span class="info-label">Interest Rate</span>
                <span class="info-value">{{ loan()!.interestRate }}% APR</span>
              </div>
            }
            @if (loan()!.monthlyPayment) {
              <div class="info-item highlight">
                <span class="info-label">Monthly Payment</span>
                <span class="info-value large">{{ loan()!.monthlyPayment | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Rejection -->
        @if (loan()!.rejectionReason) {
          <div class="card rejection-card">
            <h3>Rejection Reason</h3>
            <p>{{ loan()!.rejectionReason }}</p>
          </div>
        }

        <!-- Dates Card -->
        <div class="card">
          <h3>Timeline</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Created</span>
              <span class="info-value">{{ loan()!.createdAt | date:'MMM d, yyyy h:mm a' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Last Updated</span>
              <span class="info-value">{{ loan()!.updatedAt | date:'MMM d, yyyy h:mm a' }}</span>
            </div>
            @if (loan()!.submittedAt) {
              <div class="info-item">
                <span class="info-label">Submitted</span>
                <span class="info-value">{{ loan()!.submittedAt | date:'MMM d, yyyy h:mm a' }}</span>
              </div>
            }
            @if (loan()!.decidedAt) {
              <div class="info-item">
                <span class="info-label">Decision Date</span>
                <span class="info-value">{{ loan()!.decidedAt | date:'MMM d, yyyy h:mm a' }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          @if (loan()!.status === 'DRAFT') {
            <a class="btn-primary" [routerLink]="['/loans/new']" [queryParams]="{edit: loan()!.id}">
              &#9998; Edit Application
            </a>
            <button class="btn-submit" (click)="submit()" [disabled]="submitting">
              {{ submitting ? 'Submitting...' : 'Submit Application' }}
            </button>
          }
          @if (loan()!.status === 'APPROVED') {
            <a class="btn-primary" [routerLink]="['/dashboard/applications', loan()!.id, 'agreement']">
              View Agreement
            </a>
          }
        </div>

        @if (errorMessage) {
          <div class="error">{{ errorMessage }}</div>
        }
      } @else {
        <div class="loading">Loading application...</div>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 720px; margin: 1.5rem auto; padding: 0 1rem; }
    .detail-header { margin-bottom: 1rem; }
    .back-link { color: #2563eb; text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { text-decoration: underline; }

    .title-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .title-row h2 { margin: 0; font-size: 1.4rem; }

    .tag {
      font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 12px; font-weight: 600;
    }
    .status-draft { background: #f3f4f6; color: #374151; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .status-under_review { background: #e0e7ff; color: #3730a3; }
    .status-pending_documents { background: #fef9c3; color: #854d0e; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-signed { background: #d1fae5; color: #065f46; }

    .incomplete-banner {
      background: #fef3c7; border: 1px solid #fde68a; color: #92400e;
      padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem;
    }

    .card {
      border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem;
      margin-bottom: 1rem; background: #fff;
    }
    .card h3 { margin: 0 0 1rem; font-size: 1.05rem; color: #1e293b; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .info-item { display: flex; flex-direction: column; gap: 0.15rem; }
    .info-label { font-size: 0.78rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.03em; }
    .info-value { font-size: 0.95rem; color: #1e293b; font-weight: 500; }
    .info-value.large { font-size: 1.2rem; font-weight: 700; color: #4f46e5; }
    .info-item.highlight { grid-column: 1 / -1; }

    .empty { color: #9ca3af; font-style: italic; margin: 0; }

    .rejection-card { border-left: 4px solid #dc2626; }
    .rejection-card p { color: #991b1b; margin: 0; }

    .actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .btn-primary {
      padding: 0.6rem 1.25rem; background: #4f46e5; color: #fff; border: none;
      border-radius: 6px; font-size: 0.9rem; font-weight: 500; text-decoration: none; cursor: pointer;
    }
    .btn-primary:hover { background: #4338ca; }
    .btn-submit {
      padding: 0.6rem 1.25rem; background: #16a34a; color: #fff; border: none;
      border-radius: 6px; font-size: 0.9rem; font-weight: 500; cursor: pointer;
    }
    .btn-submit:hover { background: #15803d; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    .error { color: #dc2626; background: #fee2e2; padding: 0.75rem; border-radius: 6px; margin-top: 1rem; }
    .loading { text-align: center; padding: 3rem; color: #6b7280; }
  `]
})
export class LoanDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly loanService = inject(LoanService);
  private readonly router = inject(Router);

  loan = signal<LoanApplicationResponse | null>(null);
  submitting = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loanService.getApplication(id).subscribe({
      next: (app) => this.loan.set(app),
      error: () => this.router.navigate(['/dashboard'])
    });
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  submit(): void {
    const id = this.loan()?.id;
    if (!id) return;
    this.submitting = true;
    this.errorMessage = '';
    this.loanService.submitApplication(id).subscribe({
      next: (app) => {
        this.loan.set(app);
        this.submitting = false;
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message ?? 'Failed to submit';
      }
    });
  }
}
