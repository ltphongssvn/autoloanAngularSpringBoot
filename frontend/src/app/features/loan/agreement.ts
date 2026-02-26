import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoanService } from '../../core/services/loan.service';
import { LoanApplicationResponse } from '../../core/models/loan.model';

@Component({
  selector: 'app-agreement',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="agreement-container">
      <a [routerLink]="['/loans', loanId]">&larr; Back to Application</a>

      @if (loan()) {
        <h2>Loan Agreement — {{ loan()!.applicationNumber }}</h2>

        <div class="agreement-info">
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
        </div>

        <section class="agreement-actions">
          <button (click)="downloadPdf()" [disabled]="downloading">
            {{ downloading ? 'Downloading...' : 'Download Agreement PDF' }}
          </button>

          @if (loan()!.status === 'APPROVED') {
            <button class="sign-btn" (click)="signAgreement()" [disabled]="signing">
              {{ signing ? 'Signing...' : 'Sign Agreement' }}
            </button>
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
    .agreement-container { max-width: 600px; margin: 2rem auto; padding: 1rem; }
    .agreement-info { margin: 1.5rem 0; }
    .agreement-info div { margin-bottom: 0.5rem; }
    .agreement-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
    .sign-btn { background: #28a745; color: #fff; border: none; border-radius: 4px; }
    .error { color: red; margin-top: 1rem; }
    .success { color: green; margin-top: 1rem; }
    button { padding: 0.75rem 1.5rem; cursor: pointer; }
    button:disabled { opacity: 0.5; }
  `]
})
export class AgreementComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loanService = inject(LoanService);

  loan = signal<LoanApplicationResponse | null>(null);
  loanId = 0;
  downloading = false;
  signing = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loanId = Number(this.route.snapshot.paramMap.get('id'));
    this.loanService.getApplication(this.loanId).subscribe({
      next: (app) => this.loan.set(app),
      error: () => this.router.navigate(['/dashboard'])
    });
  }

  downloadPdf(): void {
    this.downloading = true;
    this.errorMessage = '';
    this.loanService.agreementPdf(this.loanId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `agreement-${this.loan()?.applicationNumber ?? this.loanId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        this.downloading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to download PDF';
        this.downloading = false;
      }
    });
  }

  signAgreement(): void {
    this.signing = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.loanService.signApplication(this.loanId, 'electronic-signature').subscribe({
      next: (app) => {
        this.loan.set(app);
        this.successMessage = 'Agreement signed successfully';
        this.signing = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to sign agreement';
        this.signing = false;
      }
    });
  }
}
