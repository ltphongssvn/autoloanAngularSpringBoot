import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="forgot-container">
      <h2>Forgot Password</h2>
      <p>Enter your email address and we'll send you a link to reset your password.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" />
        </div>

        <button type="submit" [disabled]="form.invalid || submitting">
          {{ submitting ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>

      @if (successMessage) {
        <div class="success">{{ successMessage }}</div>
      }
      @if (errorMessage) {
        <div class="error">{{ errorMessage }}</div>
      }

      <div class="links">
        <a routerLink="/login">Back to Login</a>
      </div>
    </div>
  `,
  styles: [`
    .forgot-container { max-width: 400px; margin: 4rem auto; padding: 2rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; }
    .form-group input { width: 100%; padding: 0.5rem; }
    button { width: 100%; padding: 0.75rem; cursor: pointer; }
    button:disabled { opacity: 0.5; }
    .success { color: green; margin-top: 1rem; }
    .error { color: red; margin-top: 1rem; }
    .links { margin-top: 1rem; text-align: center; }
  `]
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submitting = false;
  successMessage = '';
  errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.forgotPassword(this.form.value.email!).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.submitting = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to send reset link';
        this.submitting = false;
      }
    });
  }
}
