// frontend/src/app/features/auth/login.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h3 class="brand">Auto Loan</h3>
        <h2>Welcome back</h2>

        @if (errorMessage) {
          <div class="alert alert-error">{{ errorMessage }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              placeholder="you@example.com"
              [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched"
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              placeholder="Enter your password"
              [class.input-error]="form.get('password')?.invalid && form.get('password')?.touched"
            />
          </div>
          <div class="forgot-link">
            <a routerLink="/forgot-password">Forgot password?</a>
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
            @if (loading) {
              <span class="spinner-small"></span>
            } @else {
              Sign In
            }
          </button>
        </form>

        <div class="footer-links">
          <p>Don't have an account? <a routerLink="/signup">Sign up</a></p>
          <a routerLink="/" class="back-home">Back to home</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      max-width: 420px;
      width: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      padding: 2.5rem 2rem;
    }
    .brand { color: #1976d2; font-weight: 700; margin: 0 0 0.25rem; }
    h2 { margin: 0.5rem 0 1.5rem; color: #333; }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .alert-error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .form-group { margin-bottom: 1rem; }
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
    .forgot-link { text-align: right; margin-bottom: 1.25rem; }
    .forgot-link a { color: #1976d2; text-decoration: none; font-size: 0.85rem; }
    .forgot-link a:hover { text-decoration: underline; }
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
    .footer-links { margin-top: 1.5rem; text-align: center; }
    .footer-links p { margin: 0 0 0.5rem; color: #555; font-size: 0.9rem; }
    .footer-links a { color: #1976d2; text-decoration: none; }
    .footer-links a:hover { text-decoration: underline; }
    .back-home { font-size: 0.85rem; }
    .spinner-small {
      width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.4);
      border-top: 2px solid white; border-radius: 50%;
      animation: spin 0.8s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });
  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message ?? 'Login failed';
      }
    });
  }
}
