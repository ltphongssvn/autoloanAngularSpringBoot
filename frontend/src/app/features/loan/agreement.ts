// frontend/src/app/features/loan/agreement.ts
import { Component, inject, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoanService } from '../../core/services/loan.service';
import { LoanApplicationResponse } from '../../core/models/loan.model';

@Component({
  selector: 'app-agreement',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="agreement-layout">
      <header class="header-bar">
        <a [routerLink]="['/loans', loanId]" class="back-link">&larr; Back</a>
        <h2>Sign Documents</h2>
      </header>

      <div class="agreement-content">
        @if (loan()) {
          @if (!isSigned()) {
            <!-- Congrats Banner -->
            <div class="alert alert-success banner">
              <div class="banner-icon">&#10004;</div>
              <div>
                <strong>Congratulations!</strong>
                <p>Your loan application has been approved. Please review and sign below.</p>
              </div>
            </div>

            <!-- Agreement Document -->
            <div class="card">
              <h4>Loan Agreement</h4>
              <div class="agreement-doc">
                <div class="doc-title">AUTO LOAN AGREEMENT</div>
                <hr />
                <div class="doc-grid">
                  <div><strong>Borrower:</strong> {{ loan()!.personalInfo?.['first_name'] || '' }} {{ loan()!.personalInfo?.['last_name'] || '' }}</div>
                  <div><strong>Loan Amount:</strong> {{ financedAmount() | currency:'USD':'symbol':'1.0-0' }}</div>
                  <div><strong>Interest Rate:</strong> {{ loan()!.interestRate || 6.9 }}% APR</div>
                  <div><strong>Term:</strong> {{ loan()!.loanTerm }} months</div>
                  <div><strong>Monthly Payment:</strong> {{ loan()!.monthlyPayment | currency:'USD':'symbol':'1.2-2' }}</div>
                  <div><strong>First Payment Due:</strong> {{ firstPaymentDate | date:'M/d/yyyy' }}</div>
                  <hr />
                  @if (loan()!.vehicleMake) {
                    <div><strong>Vehicle:</strong> {{ loan()!.vehicleYear }} {{ loan()!.vehicleMake }} {{ loan()!.vehicleModel }}</div>
                  }
                  @if (loan()!.vehicleVin || loan()!.carDetails?.['vin']) {
                    <div><strong>VIN:</strong> {{ loan()!.vehicleVin || loan()!.carDetails?.['vin'] || 'N/A' }}</div>
                  }
                </div>
              </div>
              <button class="link-btn" (click)="downloadPdf()" [disabled]="downloading">
                &#11015; {{ downloading ? 'Downloading...' : 'Download PDF' }}
              </button>
            </div>

            <!-- Signature -->
            <div class="card">
              <h4>&#9998; Sign Below</h4>
              <div class="canvas-wrapper">
                <canvas #signatureCanvas
                  width="400" height="100"
                  (mousedown)="startDrawing($event)"
                  (mousemove)="draw($event)"
                  (mouseup)="stopDrawing()"
                  (mouseleave)="stopDrawing()">
                </canvas>
              </div>
              <button class="link-btn" (click)="clearSignature()">Clear Signature</button>

              <div class="checkboxes">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="agreedTerms" />
                  I have read and agree to the loan terms
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="authorizeSignature" />
                  I authorize electronic signature
                </label>
              </div>

              <button class="btn btn-success btn-full" (click)="signAgreement()" [disabled]="!canSign()">
                {{ signing ? 'Signing...' : 'Sign & Submit' }}
              </button>
            </div>
          } @else {
            <!-- Signed State -->
            <div class="card signed-card">
              <div class="signed-icon">&#10004;</div>
              <h3>Agreement Signed & Submitted</h3>
              <p class="signed-sub">Documents will be sent to your email.</p>
              <div class="signed-actions">
                <button class="btn btn-outlined" (click)="downloadPdf()" [disabled]="downloading">
                  &#11015; Download PDF
                </button>
                <a routerLink="/dashboard" class="btn btn-primary">&larr; Back to Dashboard</a>
              </div>
            </div>
          }

          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }
          @if (successMessage) {
            <div class="alert alert-success">{{ successMessage }}</div>
          }
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
    .agreement-layout { min-height: 100vh; background: #f5f5f5; }
    .header-bar {
      background: white; border-bottom: 1px solid #e5e7eb;
      padding: 0.875rem 2rem; display: flex; align-items: center; gap: 1.25rem;
    }
    .header-bar h2 { margin: 0; font-size: 1.35rem; color: #333; }
    .back-link { color: #1976d2; text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { text-decoration: underline; }
    .agreement-content { max-width: 720px; margin: 0 auto; padding: 1.5rem 1rem; }

    .banner { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.25rem; }
    .banner-icon { font-size: 1.5rem; color: #16a34a; }
    .banner p { margin: 0.25rem 0 0; }

    .card {
      background: white; border: 1px solid #e5e7eb; border-radius: 10px;
      padding: 1.25rem; margin-bottom: 1rem;
    }
    .card h4 { margin: 0 0 1rem; font-size: 1.05rem; color: #1e293b; }

    .agreement-doc {
      background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;
      padding: 1.25rem; max-height: 280px; overflow-y: auto; margin-bottom: 0.75rem;
    }
    .doc-title { text-align: center; font-weight: 700; font-size: 1rem; margin-bottom: 0.5rem; }
    .doc-grid { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; }
    .doc-grid hr { border: none; border-top: 1px solid #e5e7eb; margin: 0.5rem 0; }

    .link-btn {
      background: none; border: none; color: #1976d2; cursor: pointer;
      font-size: 0.9rem; padding: 0.25rem 0;
    }
    .link-btn:hover { text-decoration: underline; }
    .link-btn:disabled { opacity: 0.5; }

    .canvas-wrapper {
      border: 1px solid #d1d5db; border-radius: 6px; padding: 0.5rem;
      background: white; margin-bottom: 0.5rem; display: inline-block;
    }
    canvas { display: block; cursor: crosshair; max-width: 100%; }

    .checkboxes { margin: 1rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; }
    .checkbox-label input { width: 18px; height: 18px; cursor: pointer; }

    .btn {
      padding: 0.6rem 1.25rem; border: none; border-radius: 6px;
      font-size: 0.9rem; font-weight: 500; text-decoration: none; cursor: pointer; display: inline-block;
    }
    .btn-success { background: #16a34a; color: white; }
    .btn-success:hover { background: #15803d; }
    .btn-success:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-full { width: 100%; text-align: center; }
    .btn-primary { background: #1976d2; color: white; }
    .btn-primary:hover { background: #1565c0; }
    .btn-outlined { background: white; color: #333; border: 1px solid #d1d5db; }
    .btn-outlined:hover { background: #f3f4f6; }

    .signed-card { text-align: center; padding: 2.5rem 1.5rem; }
    .signed-icon { font-size: 3rem; color: #16a34a; margin-bottom: 0.75rem; }
    .signed-card h3 { margin: 0 0 0.5rem; font-size: 1.35rem; }
    .signed-sub { color: #6b7280; margin: 0 0 1.5rem; }
    .signed-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }

    .alert { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
    .alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
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
export class AgreementComponent implements OnInit {
  @ViewChild('signatureCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loanService = inject(LoanService);

  loan = signal<LoanApplicationResponse | null>(null);
  loanId = 0;
  downloading = false;
  signing = false;
  errorMessage = '';
  successMessage = '';

  agreedTerms = false;
  authorizeSignature = false;
  hasSignature = false;
  private isDrawing = false;

  firstPaymentDate = new Date();

  ngOnInit(): void {
    this.firstPaymentDate.setMonth(this.firstPaymentDate.getMonth() + 1);
    this.firstPaymentDate.setDate(1);

    this.loanId = Number(this.route.snapshot.paramMap.get('id'));
    this.loanService.getApplication(this.loanId).subscribe({
      next: (app) => this.loan.set(app),
      error: () => this.router.navigate(['/dashboard'])
    });
  }

  isSigned(): boolean {
    const s = this.loan()?.status;
    return s === 'SIGNED' || !!this.loan()?.signedAt;
  }

  financedAmount(): number {
    const l = this.loan();
    return (l?.loanAmount ?? 0) - (l?.downPayment ?? 0);
  }

  canSign(): boolean {
    return this.agreedTerms && this.authorizeSignature && this.hasSignature && !this.signing;
  }

  startDrawing(e: MouseEvent): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  draw(e: MouseEvent): void {
    if (!this.isDrawing) return;
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.stroke();
    this.hasSignature = true;
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  clearSignature(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    this.hasSignature = false;
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
    const canvas = this.canvasRef?.nativeElement;
    const signatureData = canvas ? canvas.toDataURL('image/png') : 'electronic-signature';
    this.loanService.signApplication(this.loanId, signatureData).subscribe({
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
