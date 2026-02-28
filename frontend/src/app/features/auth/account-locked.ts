// frontend/src/app/features/auth/account-locked.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MessageResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-account-locked',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="locked-container">
      <div class="locked-card">

        <!-- State: Unlocking via token -->
        @if (unlocking) {
          <div class="icon-wrapper">
            <span class="icon lock-icon">&#128274;</span>
          </div>
          <h2>Unlocking Account...</h2>
          <div class="spinner"></div>
        }

        <!-- State: Successfully unlocked or resend sent -->
        @if (!unlocking && (successMessage || resendSuccess)) {
          <div class="icon-wrapper">
            <span class="icon success-icon">&#10004;</span>
          </div>
          <h2>{{ successMessage ? 'Account Unlocked' : 'Unlock Email Sent' }}</h2>
          <div class="alert alert-success">
            {{ successMessage || resendSuccess }}
          </div>
          <a routerLink="/login" class="btn btn-primary">Back to Login</a>
        }

        <!-- State: Locked (default) - no token, not yet sent -->
        @if (!unlocking && !successMessage && !resendSuccess) {
          <div class="icon-wrapper">
            <span class="icon lock-icon">&#128274;</span>
          </div>
          <h2>Account Locked</h2>
          <div class="alert alert-warning">
            Your account has been locked due to too many failed login attempts.
          </div>

          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }

          <p class="instructions">Click below to receive unlock instructions via email.</p>

          <div class="button-group">
            <button
              class="btn btn-primary"
              (click)="resendUnlock()"
              [disabled]="resending">
              @if (resending) {
                <span class="spinner-small"></span>
              } @else {
                Send Unlock Instructions
              }
            </button>
            <a routerLink="/login" class="btn btn-outlined">Back to Login</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .locked-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: #f5f5f5;
    }
    .locked-card {
      max-width: 480px;
      width: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      padding: 2.5rem 2rem;
      text-align: center;
    }
    .icon-wrapper { margin-bottom: 0.5rem; }
    .icon { font-size: 3.5rem; display: inline-block; }
    .lock-icon { color: #d32f2f; }
    .success-icon {
      color: #2e7d32;
      font-size: 3.5rem;
      background: #e8f5e9;
      border-radius: 50%;
      width: 64px;
      height: 64px;
      line-height: 64px;
      display: inline-block;
    }
    h2 { margin: 0.75rem 0 1rem; color: #333; }
    .alert {
      padding: 0.875rem 1rem;
      border-radius: 4px;
      margin: 0.75rem 0;
      text-align: left;
      font-size: 0.95rem;
    }
    .alert-warning { background: #fff3e0; color: #e65100; border: 1px solid #ffe0b2; }
    .alert-error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
    .instructions { margin: 1.25rem 0 1rem; color: #555; }
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
      width: 36px; height: 36px; border: 3px solid #e0e0e0;
      border-top: 3px solid #1976d2; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 1rem auto;
    }
    .spinner-small {
      width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.4);
      border-top: 2px solid white; border-radius: 50%;
      animation: spin 0.8s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AccountLockedComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  unlockToken = '';
  email = '';
  unlocking = false;
  resending = false;
  successMessage = '';
  errorMessage = '';
  resendSuccess = '';

  ngOnInit(): void {
    this.unlockToken = this.route.snapshot.queryParamMap.get('unlock_token') ?? '';
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';

    // Fallback: read email from localStorage (matches React behavior)
    if (!this.email) {
      this.email = localStorage.getItem('lockedEmail') ?? '';
    }

    if (this.unlockToken) {
      this.unlocking = true;
      this.http.get<MessageResponse>(`${this.apiUrl}/unlock`, {
        params: { unlock_token: this.unlockToken }
      }).subscribe({
        next: (res) => {
          this.successMessage = res.message;
          this.unlocking = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message ?? 'Failed to unlock account';
          this.unlocking = false;
        }
      });
    }
  }

  resendUnlock(): void {
    if (!this.email) {
      this.errorMessage = 'Please provide your email to resend unlock instructions.';
      return;
    }
    this.resending = true;
    this.resendSuccess = '';
    this.errorMessage = '';
    this.http.post<MessageResponse>(`${this.apiUrl}/unlock`, { email: this.email }).subscribe({
      next: (res) => {
        this.resendSuccess = res.message;
        this.resending = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to resend unlock email';
        this.resending = false;
      }
    });
  }
}
