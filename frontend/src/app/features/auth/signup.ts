// frontend/src/app/features/auth/signup.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <h3 class="brand">Auto Loan</h3>
        <h2>Create your account</h2>

        @if (errorMessage) {
          <div class="alert alert-error">{{ errorMessage }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group half">
              <label for="firstName">First Name</label>
              <input id="firstName" type="text" formControlName="firstName" placeholder="John"
                [class.input-error]="form.get('firstName')?.invalid && form.get('firstName')?.touched" />
            </div>
            <div class="form-group half">
              <label for="lastName">Last Name</label>
              <input id="lastName" type="text" formControlName="lastName" placeholder="Doe"
                [class.input-error]="form.get('lastName')?.invalid && form.get('lastName')?.touched" />
            </div>
          </div>
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input id="phone" type="text" formControlName="phone" placeholder="(555) 123-4567" />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="you@example.com"
              [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="Min 8 characters"
              [class.input-error]="form.get('password')?.invalid && form.get('password')?.touched" />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" [(ngModel)]="confirmPassword"
              [ngModelOptions]="{standalone: true}" placeholder="Re-enter password"
              [class.input-error]="confirmPasswordTouched && confirmPassword !== form.get('password')?.value" />
            @if (confirmPasswordTouched && confirmPassword !== form.get('password')?.value) {
              <span class="field-error">Passwords do not match</span>
            }
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
            @if (loading) {
              <span class="spinner-small"></span>
            } @else {
              Sign Up
            }
          </button>
        </form>

        <div class="footer-links">
          <p>Already have an account? <a routerLink="/login">Login</a></p>
          <a routerLink="/" class="back-home">Back to home</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .signup-card {
      max-width: 460px;
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
    .form-row { display: flex; gap: 0.75rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group.half { flex: 1; }
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
      margin-top: 0.5rem;
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
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  confirmPassword = '';
  confirmPasswordTouched = false;
  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) return;

    // Client-side password confirmation check (matches React behavior)
    if (this.confirmPassword && this.confirmPassword !== this.form.value.password) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.authService.signup(this.form.getRawValue()).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message ?? 'Signup failed';
      }
    });
  }
}
