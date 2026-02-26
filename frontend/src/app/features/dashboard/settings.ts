import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MfaService } from '../../core/services/mfa.service';
import { ApiKeysService } from '../../core/services/api-keys.service';
import { ApiKeyResponse } from '../../core/models/api-key.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="settings-container">
      <a routerLink="/dashboard">&larr; Back to Dashboard</a>
      <h2>Settings</h2>

      <section class="mfa-section">
        <h3>Two-Factor Authentication</h3>
        @if (mfaLoading()) {
          <p>Loading MFA status...</p>
        } @else if (mfaEnabled()) {
          <p class="mfa-status enabled">MFA is enabled</p>
          <div class="mfa-action">
            <label for="disableCode">Enter code to disable:</label>
            <input id="disableCode" type="text" [(ngModel)]="mfaCode" placeholder="6-digit code" />
            <button (click)="disableMfa()" [disabled]="!mfaCode.trim() || mfaActioning">Disable MFA</button>
          </div>
        } @else {
          @if (setupData()) {
            <p>Scan this QR code with your authenticator app:</p>
            <div class="qr-url">{{ setupData()!.qrCodeUrl }}</div>
            <div class="mfa-action">
              <label for="enableCode">Enter code to verify:</label>
              <input id="enableCode" type="text" [(ngModel)]="mfaCode" placeholder="6-digit code" />
              <button (click)="enableMfa()" [disabled]="!mfaCode.trim() || mfaActioning">Enable MFA</button>
            </div>
            @if (recoveryCodes().length > 0) {
              <div class="recovery-codes">
                <h4>Recovery Codes — save these securely!</h4>
                @for (code of recoveryCodes(); track code) {
                  <div class="recovery-code">{{ code }}</div>
                }
              </div>
            }
          } @else {
            <p class="mfa-status disabled">MFA is not enabled</p>
            <button (click)="setupMfa()" [disabled]="mfaActioning">Set Up MFA</button>
          }
        }
        @if (mfaError) {
          <div class="error">{{ mfaError }}</div>
        }
        @if (mfaSuccess) {
          <div class="success">{{ mfaSuccess }}</div>
        }
      </section>

      <section class="apikeys-section">
        <h3>API Keys</h3>
        <div class="apikey-form">
          <label for="keyName">Key Name:</label>
          <input id="keyName" type="text" [(ngModel)]="newKeyName" placeholder="My API Key" />
          <button (click)="createKey()" [disabled]="!newKeyName.trim()">Create Key</button>
        </div>

        @if (newKeyValue) {
          <div class="new-key-alert">
            <strong>New API Key (copy now, it won't be shown again):</strong>
            <code>{{ newKeyValue }}</code>
          </div>
        }

        @if (apiKeys().length === 0) {
          <p>No API keys created.</p>
        }

        @for (key of apiKeys(); track key.id) {
          <div class="apikey-card">
            <div class="apikey-info">
              <strong>{{ key.name }}</strong>
              <span class="apikey-status" [class.active]="key.active">{{ key.active ? 'Active' : 'Revoked' }}</span>
            </div>
            <div class="apikey-meta">Created: {{ key.createdAt }}</div>
            <div class="apikey-actions">
              @if (key.active) {
                <button (click)="revokeKey(key.id)">Revoke</button>
              }
              <button class="delete" (click)="removeKey(key.id)">Delete</button>
            </div>
          </div>
        }

        @if (apiKeyError) {
          <div class="error">{{ apiKeyError }}</div>
        }
      </section>
    </div>
  `,
  styles: [`
    .settings-container { max-width: 700px; margin: 2rem auto; padding: 1rem; }
    .mfa-section, .apikeys-section { margin-top: 2rem; padding: 1rem; border: 1px solid #ddd; border-radius: 4px; }
    .mfa-status { font-weight: bold; margin: 0.5rem 0; }
    .mfa-status.enabled { color: green; }
    .mfa-status.disabled { color: #666; }
    .mfa-action { display: flex; align-items: center; gap: 0.5rem; margin: 0.75rem 0; flex-wrap: wrap; }
    .mfa-action input { padding: 0.5rem; width: 150px; }
    .qr-url { background: #f5f5f5; padding: 0.5rem; border-radius: 4px; word-break: break-all; margin: 0.5rem 0; font-size: 0.85rem; }
    .recovery-codes { margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 4px; }
    .recovery-code { font-family: monospace; padding: 0.25rem 0; }
    .apikey-form { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .apikey-form input { padding: 0.5rem; flex: 1; min-width: 200px; }
    .new-key-alert { background: #d4edda; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; word-break: break-all; }
    .new-key-alert code { display: block; margin-top: 0.5rem; font-size: 0.9rem; }
    .apikey-card { border: 1px solid #eee; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 4px; }
    .apikey-info { display: flex; justify-content: space-between; align-items: center; }
    .apikey-status { font-size: 0.85rem; padding: 0.1rem 0.4rem; border-radius: 3px; background: #e9ecef; }
    .apikey-status.active { background: #d4edda; color: #155724; }
    .apikey-meta { font-size: 0.8rem; color: #666; margin: 0.25rem 0; }
    .apikey-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .delete { background: #dc3545; color: #fff; border: none; border-radius: 4px; }
    .error { color: red; margin-top: 0.5rem; }
    .success { color: green; margin-top: 0.5rem; }
    button { padding: 0.5rem 1rem; cursor: pointer; }
    button:disabled { opacity: 0.5; }
  `]
})
export class SettingsComponent implements OnInit {
  private readonly mfaService = inject(MfaService);
  private readonly apiKeysService = inject(ApiKeysService);

  mfaLoading = signal(true);
  mfaEnabled = signal(false);
  setupData = signal<{ secret: string; qrCodeUrl: string } | null>(null); // pragma: allowlist secret
  recoveryCodes = signal<string[]>([]);
  mfaCode = '';
  mfaActioning = false;
  mfaError = '';
  mfaSuccess = '';

  apiKeys = signal<ApiKeyResponse[]>([]);
  newKeyName = '';
  newKeyValue = '';
  apiKeyError = '';

  ngOnInit(): void {
    this.loadMfaStatus();
    this.loadApiKeys();
  }

  setupMfa(): void {
    this.mfaActioning = true;
    this.mfaError = '';
    this.mfaService.setup().subscribe({
      next: (res) => {
        this.setupData.set(res);
        this.mfaActioning = false;
      },
      error: (err) => {
        this.mfaError = err.error?.message ?? 'Failed to set up MFA';
        this.mfaActioning = false;
      }
    });
  }

  enableMfa(): void {
    this.mfaActioning = true;
    this.mfaError = '';
    this.mfaService.enable(this.mfaCode).subscribe({
      next: (res) => {
        this.mfaEnabled.set(res.enabled);
        this.recoveryCodes.set(res.recoveryCodes ?? []);
        this.setupData.set(null);
        this.mfaCode = '';
        this.mfaSuccess = 'MFA enabled successfully';
        this.mfaActioning = false;
      },
      error: (err) => {
        this.mfaError = err.error?.message ?? 'Invalid code';
        this.mfaActioning = false;
      }
    });
  }

  disableMfa(): void {
    this.mfaActioning = true;
    this.mfaError = '';
    this.mfaService.disable(this.mfaCode).subscribe({
      next: (res) => {
        this.mfaEnabled.set(res.enabled);
        this.mfaCode = '';
        this.recoveryCodes.set([]);
        this.mfaSuccess = 'MFA disabled successfully';
        this.mfaActioning = false;
      },
      error: (err) => {
        this.mfaError = err.error?.message ?? 'Invalid code';
        this.mfaActioning = false;
      }
    });
  }

  createKey(): void {
    if (!this.newKeyName.trim()) return;
    this.apiKeyError = '';
    this.newKeyValue = '';
    this.apiKeysService.create({ name: this.newKeyName }).subscribe({
      next: (key) => {
        this.newKeyValue = key.key ?? '';
        this.apiKeys.update(keys => [key, ...keys]);
        this.newKeyName = '';
      },
      error: (err) => this.apiKeyError = err.error?.message ?? 'Failed to create key'
    });
  }

  revokeKey(id: number): void {
    this.apiKeyError = '';
    this.apiKeysService.revoke(id).subscribe({
      next: (updated) => {
        this.apiKeys.update(keys => keys.map(k => k.id === id ? updated : k));
      },
      error: (err) => this.apiKeyError = err.error?.message ?? 'Failed to revoke key'
    });
  }

  removeKey(id: number): void {
    this.apiKeyError = '';
    this.apiKeysService.remove(id).subscribe({
      next: () => {
        this.apiKeys.update(keys => keys.filter(k => k.id !== id));
      },
      error: (err) => this.apiKeyError = err.error?.message ?? 'Failed to delete key'
    });
  }

  private loadMfaStatus(): void {
    this.mfaService.status().subscribe({
      next: (res) => {
        this.mfaEnabled.set(res.enabled);
        this.mfaLoading.set(false);
      },
      error: () => this.mfaLoading.set(false)
    });
  }

  private loadApiKeys(): void {
    this.apiKeysService.list().subscribe({
      next: (keys) => this.apiKeys.set(keys),
      error: () => this.apiKeys.set([])
    });
  }
}
