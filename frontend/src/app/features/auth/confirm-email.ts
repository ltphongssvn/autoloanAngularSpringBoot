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
      <h2>Email Confirmation</h2>

      @if (loading) {
        <p>Confirming your email...</p>
      }

      @if (successMessage) {
        <div class="success">
          <p>{{ successMessage }}</p>
          <a routerLink="/login">Go to Login</a>
        </div>
      }

      @if (errorMessage) {
        <div class="error">
          <p>{{ errorMessage }}</p>
          <button (click)="resend()" [disabled]="resending">
            {{ resending ? 'Sending...' : 'Resend Confirmation Email' }}
          </button>
        </div>
      }

      @if (resendSuccess) {
        <div class="success">{{ resendSuccess }}</div>
      }

      <div class="links">
        <a routerLink="/login">Back to Login</a>
      </div>
    </div>
  `,
  styles: [`
    .confirm-container { max-width: 400px; margin: 4rem auto; padding: 2rem; text-align: center; }
    .success { color: green; margin: 1rem 0; }
    .error { color: red; margin: 1rem 0; }
    .links { margin-top: 1.5rem; }
    button { padding: 0.75rem 1.5rem; cursor: pointer; margin-top: 0.5rem; }
    button:disabled { opacity: 0.5; }
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
