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
      <a routerLink="/dashboard">&larr; Back to Dashboard</a>
      @if (loan()) {
        <h2>Application {{ loan()!.applicationNumber }}</h2>
        <div class="info">
          <div><strong>Status:</strong> {{ loan()!.status }}</div>
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
        @if (loan()!.status === 'DRAFT') {
          <button (click)="submit()" [disabled]="submitting">
            {{ submitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        }
      } @else {
        <p>Loading...</p>
      }
      @if (errorMessage) {
        <div class="error">{{ errorMessage }}</div>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 600px; margin: 2rem auto; padding: 1rem; }
    .info { margin: 1rem 0; }
    .info div { margin-bottom: 0.5rem; }
    .rejection { color: red; }
    .error { color: red; margin-top: 1rem; }
    button { padding: 0.75rem 2rem; cursor: pointer; }
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
