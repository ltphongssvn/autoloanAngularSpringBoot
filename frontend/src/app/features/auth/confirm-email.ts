// frontend/src/app/features/auth/confirm-email.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="confirm-container">
      <div class="confirm-card">
        <h2>Email Confirmation</h2>

        <!-- State: Loading -->
        @if (loading) {
          <div class="loading-section">
            <div class="spinner"></div>
            <p>Confirming your email...</p>
          </div>
        }

        <!-- State: Success (confirmed or resend sent) -->
        @if (!loading && (successMessage || resendSuccess)) {
          <div class="icon-wrapper">
            <span class="icon success-icon">&#10004;</span>
          </div>
          <div class="alert alert-success">
            {{ successMessage || resendSuccess }}
          </div>
          <a routerLink="/login" class="btn btn-primary">Go to Login</a>
        }

        <!-- State: Error -->
        @if (!loading && !successMessage && !resendSuccess && errorMessage) {
          <div class="icon-wrapper">
            <span class="icon error-icon">&#10008;</span>
          </div>
          <div class="alert alert-error">
            {{ errorMessage }}
          </div>
          <div class="button-group">
            <button
              class="btn btn-primary"
              (click)="resend()"
              [disabled]="resending">
              @if (resending) {
                <span class="spinner-small"></span>
              } @else {
                Resend Confirmation Email
              }
            </button>
            <a routerLink="/login" class="btn btn-outlined">Back to Login</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .confirm-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: #f5f5f5;
    }
    .confirm-card {
      max-width: 480px;
      width: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      padding: 2.5rem 2rem;
      text-align: center;
    }
    h2 { margin: 0 0 1.5rem; color: #333; }
    .loading-section { margin: 2rem 0; }
    .loading-section p { margin-top: 1rem; color: #555; }
    .icon-wrapper { margin-bottom: 0.75rem; }
    .icon { font-size: 3.5rem; display: inline-block; }
    .success-icon {
      color: #2e7d32;
      background: #e8f5e9;
      border-radius: 50%;
      width: 64px;
      height: 64px;
      line-height: 64px;
      display: inline-block;
    }
    .error-icon {
      color: #c62828;
      background: #ffebee;
      border-radius: 50%;
      width: 64px;
      height: 64px;
      line-height: 64px;
      display: inline-block;
    }
    .alert {
      padding: 0.875rem 1rem;
      border-radius: 4px;
      margin: 0.75rem 0 1.25rem;
      text-align: left;
      font-size: 0.95rem;
    }
    .alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
    .alert-error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .button-group { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 120px;
      border: none;
    }
    .btn-primary { background: #1976d2; color: white; }
    .btn-primary:hover { background: #1565c0; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-outlined { background: transparent; color: #1976d2; border: 1px solid #1976d2; }
    .btn-outlined:hover { background: #e3f2fd; }
    .spinner {
      width: 48px; height: 48px; border: 4px solid #e0e0e0;
      border-top: 4px solid #1976d2; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto;
    }
    .spinner-small {
      width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.4);
      border-top: 2px solid white; border-radius: 50%;
      animation: spin 0.8s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ConfirmEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  loading = false;
  successMessage = '';
  errorMessage = '';
  resending = false;
  resendSuccess = '';
  private email = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('confirmation_token');
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';

    // Fallback: read email from localStorage (matches React behavior)
    if (!this.email) {
      this.email = localStorage.getItem('confirmEmail') ?? '';
    }

    if (token) {
      this.loading = true;
      this.authService.confirmEmail(token).subscribe({
        next: (res) => {
          this.successMessage = res.message;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message ?? 'Email confirmation failed';
          this.loading = false;
        }
      });
    } else {
      this.errorMessage = 'Invalid or missing confirmation token.';
    }
  }

  resend(): void {
    if (!this.email) {
      this.errorMessage = 'Please provide your email to resend confirmation.';
      return;
    }
    this.resending = true;
    this.resendSuccess = '';
    this.errorMessage = '';
    this.authService.resendConfirmation(this.email).subscribe({
      next: (res) => {
        this.resendSuccess = res.message;
        this.resending = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to resend confirmation';
        this.resending = false;
      }
    });
  }
}
