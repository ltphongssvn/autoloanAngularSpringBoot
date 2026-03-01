import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MfaService } from '../../core/services/mfa.service';
import { MfaSetupResponse } from '../../core/models/mfa.model';

@Component({
  selector: 'app-mfa-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mfa-container">
      <a routerLink="/profile">&larr; Back to Profile</a>
      <h2>Two-Factor Authentication</h2>

      @if (loading()) {
        <p>Loading MFA status...</p>
      } @else if (mfaEnabled()) {
        <div class="status-card enabled">
          <h3>MFA is Enabled</h3>
          <p>Your account is protected with two-factor authentication.</p>
          <div class="action-form">
            <label for="disableCode">Enter code to disable MFA:</label>
            <input id="disableCode" type="text" [(ngModel)]="code" placeholder="6-digit code" maxlength="6" />
            <button class="danger" (click)="disableMfa()" [disabled]="!code.trim() || actioning">
              {{ actioning ? 'Disabling...' : 'Disable MFA' }}
            </button>
          </div>
        </div>
      } @else {
        <div class="status-card">
          <h3>MFA is Not Enabled</h3>
          <p>Add an extra layer of security to your account.</p>

          @if (!setupData()) {
            <button (click)="setupMfa()" [disabled]="actioning">
              {{ actioning ? 'Setting up...' : 'Set Up MFA' }}
            </button>
          } @else {
            <div class="setup-section">
              <p>Scan this QR code with your authenticator app:</p>
              <div class="qr-url">{{ setupData()!.qrCodeUrl }}</div>
              <p class="secret-label">Or enter this code manually:</p>
              <code class="manual-code">{{ setupData()!.secret }}</code>
              <div class="action-form">
                <label for="enableCode">Enter verification code:</label>
                <input id="enableCode" type="text" [(ngModel)]="code" placeholder="6-digit code" maxlength="6" />
                <button (click)="enableMfa()" [disabled]="!code.trim() || actioning">
                  {{ actioning ? 'Verifying...' : 'Verify & Enable' }}
                </button>
              </div>
            </div>
          }
        </div>

        @if (recoveryCodes().length > 0) {
          <div class="recovery-section">
            <h3>Recovery Codes</h3>
            <p>Save these codes securely. Each can be used once if you lose your authenticator.</p>
            <div class="recovery-codes">
              @for (rc of recoveryCodes(); track rc) {
                <code class="recovery-code">{{ rc }}</code>
              }
            </div>
          </div>
        }
      }

      @if (errorMessage) {
        <div class="error">{{ errorMessage }}</div>
      }
      @if (successMessage) {
        <div class="success">{{ successMessage }}</div>
      }
    </div>
  `,
  styles: [`
    .mfa-container { max-width: 500px; margin: 2rem auto; padding: 1rem; }
    .status-card { margin: 1.5rem 0; padding: 1.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .status-card.enabled { border-color: #28a745; background: #f8fff9; }
    .action-form { margin-top: 1rem; }
    .action-form label { display: block; margin-bottom: 0.25rem; }
    .action-form input { padding: 0.5rem; width: 150px; margin-bottom: 0.5rem; display: block; }
    .setup-section { margin-top: 1rem; }
    .qr-url { background: #f5f5f5; padding: 0.75rem; border-radius: 4px; word-break: break-all; font-size: 0.85rem; margin: 0.5rem 0; }
    .secret-label { margin-top: 1rem; font-size: 0.9rem; color: #666; }
    .manual-code { display: block; background: #f5f5f5; padding: 0.5rem; border-radius: 4px; font-size: 1.1rem; letter-spacing: 2px; margin-bottom: 1rem; }
    .recovery-section { margin-top: 1.5rem; padding: 1.5rem; background: #fff3cd; border-radius: 4px; }
    .recovery-codes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 0.75rem; }
    .recovery-code { display: block; background: #fff; padding: 0.5rem; border-radius: 4px; text-align: center; font-size: 0.95rem; }
    .danger { background: #dc3545; color: #fff; border: none; border-radius: 4px; }
    .error { color: red; margin-top: 1rem; }
    .success { color: green; margin-top: 1rem; }
    button { padding: 0.5rem 1rem; cursor: pointer; }
    button:disabled { opacity: 0.5; }
  `]
})
export class MfaSettingsComponent implements OnInit {
  private readonly mfaService = inject(MfaService);

  loading = signal(true);
  mfaEnabled = signal(false);
  setupData = signal<MfaSetupResponse | null>(null);
  recoveryCodes = signal<string[]>([]);

  code = '';
  actioning = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.mfaService.status().subscribe({
      next: (res) => {
        this.mfaEnabled.set(res.enabled);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setupMfa(): void {
    this.actioning = true;
    this.clearMessages();
    this.mfaService.setup().subscribe({
      next: (res) => {
        this.setupData.set(res);
        this.actioning = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to set up MFA';
        this.actioning = false;
      }
    });
  }

  enableMfa(): void {
    this.actioning = true;
    this.clearMessages();
    this.mfaService.enable(this.code).subscribe({
      next: (res) => {
        this.mfaEnabled.set(res.enabled);
        this.recoveryCodes.set(res.recoveryCodes ?? []);
        this.setupData.set(null);
        this.code = '';
        this.successMessage = 'MFA enabled successfully';
        this.actioning = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Invalid verification code';
        this.actioning = false;
      }
    });
  }

  disableMfa(): void {
    this.actioning = true;
    this.clearMessages();
    this.mfaService.disable(this.code).subscribe({
      next: (res) => {
        this.mfaEnabled.set(res.enabled);
        this.code = '';
        this.recoveryCodes.set([]);
        this.successMessage = 'MFA disabled successfully';
        this.actioning = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Invalid verification code';
        this.actioning = false;
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
