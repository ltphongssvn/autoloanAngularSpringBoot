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
      <h2>Account Locked</h2>

      @if (unlocking) {
        <p>Unlocking your account...</p>
      }

      @if (!unlocking && !successMessage && !unlockToken) {
        <p>Your account has been locked due to too many failed login attempts.</p>
        <p>Please check your email for an unlock link, or request a new one below.</p>
        <button (click)="resendUnlock()" [disabled]="resending">
          {{ resending ? 'Sending...' : 'Resend Unlock Email' }}
        </button>
      }

      @if (successMessage) {
        <div class="success">
          <p>{{ successMessage }}</p>
          <a routerLink="/login">Go to Login</a>
        </div>
      }

      @if (errorMessage) {
        <div class="error">{{ errorMessage }}</div>
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
    .locked-container { max-width: 400px; margin: 4rem auto; padding: 2rem; text-align: center; }
    .success { color: green; margin: 1rem 0; }
    .error { color: red; margin: 1rem 0; }
    .links { margin-top: 1.5rem; }
    button { padding: 0.75rem 1.5rem; cursor: pointer; }
    button:disabled { opacity: 0.5; }
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
