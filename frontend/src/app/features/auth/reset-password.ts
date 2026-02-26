import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="reset-container">
      <h2>Reset Password</h2>
      <p>Enter your new password below.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="password">New Password</label>
          <input id="password" type="password" formControlName="password" />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" formControlName="confirmPassword" />
        </div>

        @if (form.hasError('mismatch')) {
          <div class="error">Passwords do not match.</div>
        }

        <button type="submit" [disabled]="form.invalid || submitting">
          {{ submitting ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>

      @if (successMessage) {
        <div class="success">{{ successMessage }} <a routerLink="/login">Go to Login</a></div>
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
    .reset-container { max-width: 400px; margin: 4rem auto; padding: 2rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; }
    .form-group input { width: 100%; padding: 0.5rem; }
    button { width: 100%; padding: 0.75rem; cursor: pointer; }
    button:disabled { opacity: 0.5; }
    .success { color: green; margin-top: 1rem; }
    .error { color: red; margin-top: 0.5rem; }
    .links { margin-top: 1rem; text-align: center; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  token = '';
  submitting = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token.';
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) return;
    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.resetPassword(this.token, this.form.value.password!).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.submitting = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to reset password';
        this.submitting = false;
      }
    });
  }

  private passwordMatchValidator(group: import('@angular/forms').AbstractControl) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }
}
