// frontend/src/app/features/auth/reset-password.ts
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
      <div class="reset-card">
        <h3 class="brand">Auto Loan</h3>
        <h2>Reset Password</h2>
        <p class="subtitle">Enter your new password below.</p>

        @if (errorMessage) {
          <div class="alert alert-error">{{ errorMessage }}</div>
        }
        @if (successMessage) {
          <div class="alert alert-success">
            {{ successMessage }}
            <a routerLink="/login" class="alert-link">Go to Login</a>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="password">New Password</label>
            <input id="password" type="password" formControlName="password" placeholder="Min 8 characters"
              [class.input-error]="form.get('password')?.invalid && form.get('password')?.touched" />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" formControlName="confirmPassword" placeholder="Re-enter password"
              [class.input-error]="form.hasError('mismatch') && form.get('confirmPassword')?.touched" />
            @if (form.hasError('mismatch') && form.get('confirmPassword')?.touched) {
              <span class="field-error">Passwords do not match</span>
            }
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || submitting">
            @if (submitting) {
              <span class="spinner-small"></span>
            } @else {
              Reset Password
            }
          </button>
        </form>

        <div class="links">
          <a routerLink="/login">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reset-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .reset-card {
      max-width: 420px;
      width: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      padding: 2.5rem 2rem;
    }
    .brand { color: #1976d2; font-weight: 700; margin: 0 0 0.25rem; }
    h2 { margin: 0.5rem 0 0.25rem; color: #333; }
    .subtitle { color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .alert-error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
    .alert-link { color: #2e7d32; font-weight: 600; margin-left: 0.5rem; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; margin-bottom: 0.375rem; font-weight: 500; color: #333; font-size: 0.9rem; }
    .form-group input {
      width: 100%;
      padding: 0.625rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .form-group input:focus { outline: none; border-color: #1976d2; box-shadow: 0 0 0 2px rgba(25,118,210,0.15); }
    .input-error { border-color: #c62828 !important; }
    .field-error { color: #c62828; font-size: 0.8rem; margin-top: 0.25rem; display: block; }
    .btn {
      width: 100%;
      padding: 0.75rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
    }
    .btn-primary { background: #1976d2; color: white; }
    .btn-primary:hover { background: #1565c0; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .links { margin-top: 1.25rem; text-align: center; }
    .links a { color: #1976d2; text-decoration: none; font-size: 0.9rem; }
    .links a:hover { text-decoration: underline; }
    .spinner-small {
      width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.4);
      border-top: 2px solid white; border-radius: 50%;
      animation: spin 0.8s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
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
