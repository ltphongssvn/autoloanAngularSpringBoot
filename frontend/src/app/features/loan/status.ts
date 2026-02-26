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
    <div class="status-container">
      <a [routerLink]="['/loans', loanId]">&larr; Back to Application</a>

      @if (loan()) {
        <h2>Application Status — {{ loan()!.applicationNumber }}</h2>

        <div class="current-status">
          <span class="status-badge" [attr.data-status]="loan()!.status">{{ loan()!.status }}</span>
        </div>

        <div class="info">
          <div><strong>Loan Amount:</strong> {{ loan()!.loanAmount | currency }}</div>
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
          @if (loan()!.submittedAt) {
            <div><strong>Submitted:</strong> {{ loan()!.submittedAt }}</div>
          }
          @if (loan()!.decidedAt) {
            <div><strong>Decision Date:</strong> {{ loan()!.decidedAt }}</div>
          }
        </div>

        <section class="history-section">
          <h3>Status History</h3>
          @if (history().length === 0) {
            <p>No status changes recorded.</p>
          }
          @for (entry of history(); track entry.id) {
            <div class="history-entry">
              <div class="history-transition">
                <span class="from">{{ entry.fromStatus }}</span>
                <span class="arrow">→</span>
                <span class="to">{{ entry.toStatus }}</span>
              </div>
              @if (entry.comment) {
                <div class="history-comment">{{ entry.comment }}</div>
              }
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
    </div>
  `,
  styles: [`
    .status-container { max-width: 600px; margin: 2rem auto; padding: 1rem; }
    .current-status { margin: 1rem 0; }
    .status-badge { display: inline-block; padding: 0.4rem 1rem; border-radius: 4px; font-size: 1.1rem; font-weight: bold; background: #e9ecef; }
    .info { margin: 1.5rem 0; }
    .info div { margin-bottom: 0.5rem; }
    .rejection { color: red; }
    .history-section { margin-top: 2rem; }
    .history-entry { padding: 0.75rem; margin-bottom: 0.5rem; border: 1px solid #eee; border-radius: 4px; }
    .history-transition { display: flex; align-items: center; gap: 0.5rem; font-weight: bold; }
    .from { color: #666; }
    .arrow { color: #999; }
    .to { color: #333; }
    .history-comment { margin-top: 0.25rem; color: #555; font-style: italic; }
    .history-meta { font-size: 0.8rem; color: #999; margin-top: 0.25rem; }
    .error { color: red; margin-top: 1rem; }
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

  ngOnInit(): void {
    this.loanId = Number(this.route.snapshot.paramMap.get('id'));
    this.loanService.getApplication(this.loanId).subscribe({
      next: (app) => this.loan.set(app),
      error: () => this.router.navigate(['/dashboard'])
    });
    this.loanService.getHistory(this.loanId).subscribe({
      next: (h) => this.history.set(h),
      error: () => this.history.set([])
    });
  }
}
