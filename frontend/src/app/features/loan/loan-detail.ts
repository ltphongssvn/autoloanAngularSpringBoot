// frontend/src/app/features/loan/loan-detail.ts
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
    <div class="detail-layout">
      <header class="header-bar">
        <a routerLink="/dashboard" class="back-link">&larr; Back to Dashboard</a>
        <h2>Application Details</h2>
      </header>

      <div class="detail-content">
        @if (loan()) {
          <div class="title-row">
            <h2>{{ loan()!.applicationNumber }}</h2>
            <span class="tag" [class]="'status-' + loan()!.status.toLowerCase()">{{ formatStatus(loan()!.status) }}</span>
          </div>

          @if (loan()!.status === 'DRAFT') {
            <div class="incomplete-banner">
              <span>&#9888;</span> This application is incomplete. Fill in the required information and submit.
            </div>
          }

          <!-- Personal Information -->
          <div class="card">
            <h3>Personal Information</h3>
            @if (loan()!.personalInfo) {
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name</span>
                  <span class="info-value">{{ loan()!.personalInfo!['first_name'] || '' }} {{ loan()!.personalInfo!['last_name'] || '' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ loan()!.personalInfo!['email'] || '—' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone</span>
                  <span class="info-value">{{ loan()!.personalInfo!['phone'] || '—' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date of Birth</span>
                  <span class="info-value">{{ loan()!.personalInfo!['dob'] || loan()!.dob || '—' }}</span>
                </div>
                @if (loan()!.personalInfo!['address']) {
                  <div class="info-item full-width">
                    <span class="info-label">Address</span>
                    <span class="info-value">{{ loan()!.personalInfo!['address'] }}, {{ loan()!.personalInfo!['city'] }}, {{ loan()!.personalInfo!['state'] }} {{ loan()!.personalInfo!['zip'] }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="empty">No personal information available.</p>
            }
          </div>

          <!-- Vehicle Card -->
          <div class="card">
            <h3>Vehicle Information</h3>
            @if (loan()!.vehicleMake || loan()!.carDetails?.['make']) {
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Vehicle</span>
                  <span class="info-value">{{ loan()!.vehicleYear || loan()!.carDetails?.['year'] }} {{ loan()!.vehicleMake || loan()!.carDetails?.['make'] }} {{ loan()!.vehicleModel || loan()!.carDetails?.['model'] }}</span>
                </div>
                @if (loan()!.vehicleTrim || loan()!.carDetails?.['trim']) {
                  <div class="info-item">
                    <span class="info-label">Trim</span>
                    <span class="info-value">{{ loan()!.vehicleTrim || loan()!.carDetails?.['trim'] }}</span>
                  </div>
                }
                @if (loan()!.carDetails?.['condition']) {
                  <div class="info-item">
                    <span class="info-label">Condition</span>
                    <span class="info-value">{{ loan()!.carDetails!['condition'] }}</span>
                  </div>
                }
                @if (loan()!.carDetails?.['price']) {
                  <div class="info-item">
                    <span class="info-label">Price</span>
                    <span class="info-value">{{ +loan()!.carDetails!['price'] | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                }
                @if (loan()!.vehicleVin || loan()!.carDetails?.['vin']) {
                  <div class="info-item">
                    <span class="info-label">VIN</span>
                    <span class="info-value">{{ loan()!.vehicleVin || loan()!.carDetails?.['vin'] }}</span>
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

          <!-- Employment Information -->
          <div class="card">
            <h3>Employment Information</h3>
            @if (loan()!.employmentInfo && (loan()!.employmentInfo!['employer'] || loan()!.employmentInfo!['income'])) {
              <div class="info-grid">
                @if (loan()!.employmentInfo!['employer']) {
                  <div class="info-item">
                    <span class="info-label">Employer</span>
                    <span class="info-value">{{ loan()!.employmentInfo!['employer'] }}</span>
                  </div>
                }
                @if (loan()!.employmentInfo!['job_title']) {
                  <div class="info-item">
                    <span class="info-label">Job Title</span>
                    <span class="info-value">{{ loan()!.employmentInfo!['job_title'] }}</span>
                  </div>
                }
                @if (loan()!.employmentInfo!['years']) {
                  <div class="info-item">
                    <span class="info-label">Years Employed</span>
                    <span class="info-value">{{ loan()!.employmentInfo!['years'] }} years</span>
                  </div>
                }
                @if (loan()!.employmentInfo!['income']) {
                  <div class="info-item">
                    <span class="info-label">Annual Income</span>
                    <span class="info-value">{{ +loan()!.employmentInfo!['income'] | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                }
                @if (loan()!.employmentInfo!['credit_score']) {
                  <div class="info-item">
                    <span class="info-label">Credit Score</span>
                    <span class="info-value">{{ loan()!.employmentInfo!['credit_score'] }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="empty">No employment information provided yet.</p>
            }
          </div>

          <!-- Rejection -->
          @if (loan()!.rejectionReason) {
            <div class="card rejection-card">
              <h3>Rejection Reason</h3>
              <p>{{ loan()!.rejectionReason }}</p>
            </div>
          }

          <!-- Timeline Card -->
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
              <a class="btn btn-primary" [routerLink]="['/loans/new']" [queryParams]="{edit: loan()!.id}">
                &#9998; Edit Application
              </a>
              <button class="btn btn-submit" (click)="submit()" [disabled]="submitting">
                {{ submitting ? 'Submitting...' : 'Submit Application' }}
              </button>
            }
            @if (loan()!.status === 'APPROVED') {
              <a class="btn btn-primary" [routerLink]="['/dashboard/applications', loan()!.id, 'agreement']">
                View Agreement
              </a>
            }
          </div>

          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }
        } @else {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading application...</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .detail-layout { min-height: 100vh; background: #f5f5f5; }
    .header-bar {
      background: white; border-bottom: 1px solid #e5e7eb;
      padding: 0.875rem 2rem; display: flex; align-items: center; gap: 1.25rem;
    }
    .header-bar h2 { margin: 0; font-size: 1.35rem; color: #333; }
    .back-link { color: #1976d2; text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { text-decoration: underline; }
    .detail-content { max-width: 760px; margin: 0 auto; padding: 1.5rem 1rem; }

    .title-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .title-row h2 { margin: 0; font-size: 1.4rem; }

    .tag { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 12px; font-weight: 600; }
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
    .info-item.full-width { grid-column: 1 / -1; }
    .info-label { font-size: 0.78rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.03em; }
    .info-value { font-size: 0.95rem; color: #1e293b; font-weight: 500; }
    .info-value.large { font-size: 1.2rem; font-weight: 700; color: #4f46e5; }
    .info-item.highlight { grid-column: 1 / -1; }

    .empty { color: #9ca3af; font-style: italic; margin: 0; }

    .rejection-card { border-left: 4px solid #dc2626; }
    .rejection-card p { color: #991b1b; margin: 0; }

    .actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .btn {
      padding: 0.6rem 1.25rem; border: none; border-radius: 6px;
      font-size: 0.9rem; font-weight: 500; text-decoration: none; cursor: pointer;
    }
    .btn-primary { background: #4f46e5; color: #fff; }
    .btn-primary:hover { background: #4338ca; }
    .btn-submit { background: #16a34a; color: #fff; }
    .btn-submit:hover { background: #15803d; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    .alert { padding: 0.75rem 1rem; border-radius: 6px; margin-top: 1rem; font-size: 0.9rem; }
    .alert-error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }

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
