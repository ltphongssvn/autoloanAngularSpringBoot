// frontend/src/app/features/dashboard/settings.ts
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
    <div class="settings-layout">
      <!-- Header Bar -->
      <header class="header-bar">
        <div class="header-left">
          <a routerLink="/dashboard" class="back-btn">&larr; Back to Dashboard</a>
          <h2>Account Settings</h2>
        </div>
      </header>

      <div class="settings-content">
        <!-- MFA Section -->
        <section class="section-card">
          <h3>Security Settings</h3>
          <div class="section-body">
            <h4>Two-Factor Authentication</h4>
            @if (mfaLoading()) {
              <div class="loading-inline">
                <span class="spinner-small"></span> Loading MFA status...
              </div>
            } @else if (mfaEnabled()) {
              <div class="alert alert-success">MFA is enabled</div>
              <div class="mfa-action">
                <label for="disableCode">Enter code to disable:</label>
                <input id="disableCode" type="text" [(ngModel)]="mfaCode" placeholder="6-digit code" class="input-sm" />
                <button class="btn btn-danger" (click)="disableMfa()" [disabled]="!mfaCode.trim() || mfaActioning">
                  {{ mfaActioning ? 'Processing...' : 'Disable MFA' }}
                </button>
              </div>
            } @else {
              @if (setupData()) {
                <p>Scan this QR code with your authenticator app:</p>
                <div class="qr-url">{{ setupData()!.qrCodeUrl }}</div>
                <div class="mfa-action">
                  <label for="enableCode">Enter code to verify:</label>
                  <input id="enableCode" type="text" [(ngModel)]="mfaCode" placeholder="6-digit code" class="input-sm" />
                  <button class="btn btn-primary" (click)="enableMfa()" [disabled]="!mfaCode.trim() || mfaActioning">
                    {{ mfaActioning ? 'Verifying...' : 'Enable MFA' }}
                  </button>
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
                <p class="mfa-status-text">MFA is not enabled</p>
                <button class="btn btn-primary" (click)="setupMfa()" [disabled]="mfaActioning">
                  {{ mfaActioning ? 'Setting up...' : 'Set Up MFA' }}
                </button>
              }
            }
            @if (mfaError) {
              <div class="alert alert-error">{{ mfaError }}</div>
            }
            @if (mfaSuccess) {
              <div class="alert alert-success">{{ mfaSuccess }}</div>
            }
          </div>
        </section>

        <!-- API Keys Section -->
        <section class="section-card">
          <h3>API Keys</h3>
          <div class="section-body">
            <div class="apikey-form">
              <input type="text" [(ngModel)]="newKeyName" placeholder="Key name" class="input-sm input-flex" />
              <button class="btn btn-primary" (click)="createKey()" [disabled]="!newKeyName.trim()">Create Key</button>
            </div>

            @if (newKeyValue) {
              <div class="alert alert-warning">
                <strong>New API Key (copy now, it won't be shown again):</strong>
                <code class="key-display">{{ newKeyValue }}</code>
              </div>
            }

            @if (apiKeys().length === 0) {
              <p class="empty-text">No API keys created.</p>
            }

            @for (key of apiKeys(); track key.id) {
              <div class="apikey-card">
                <div class="apikey-info">
                  <strong>{{ key.name }}</strong>
                  <span class="apikey-badge" [class.active]="key.active">{{ key.active ? 'Active' : 'Revoked' }}</span>
                </div>
                <div class="apikey-meta">Created: {{ key.createdAt }}</div>
                <div class="apikey-actions">
                  @if (key.active) {
                    <button class="btn btn-sm btn-outlined" (click)="revokeKey(key.id)">Revoke</button>
                  }
                  <button class="btn btn-sm btn-danger" (click)="removeKey(key.id)">Delete</button>
                </div>
              </div>
            }

            @if (apiKeyError) {
              <div class="alert alert-error">{{ apiKeyError }}</div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .settings-layout { min-height: 100vh; background: #f5f5f5; }
    .header-bar {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 0.875rem 2rem;
      display: flex;
      align-items: center;
    }
    .header-left { display: flex; align-items: center; gap: 1.25rem; }
    .back-btn { color: #1976d2; text-decoration: none; font-size: 0.9rem; }
    .back-btn:hover { text-decoration: underline; }
    .header-bar h2 { margin: 0; font-size: 1.35rem; color: #333; }
    .settings-content { max-width: 720px; margin: 0 auto; padding: 1.5rem 1rem; }
    .section-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      margin-bottom: 1.5rem;
      overflow: hidden;
    }
    .section-card h3 {
      margin: 0;
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
      border-bottom: 1px solid #e5e7eb;
      color: #333;
    }
    .section-body { padding: 1.25rem 1.5rem; }
    .section-body h4 { margin: 0 0 0.75rem; font-size: 1rem; color: #444; }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 4px;
      margin: 0.75rem 0;
      font-size: 0.9rem;
    }
    .alert-error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
    .alert-warning { background: #fff8e1; color: #f57f17; border: 1px solid #ffecb3; }
    .mfa-status-text { color: #666; margin: 0.5rem 0; }
    .mfa-action { display: flex; align-items: center; gap: 0.5rem; margin: 0.75rem 0; flex-wrap: wrap; }
    .qr-url {
      background: #f5f5f5; padding: 0.75rem; border-radius: 4px;
      word-break: break-all; margin: 0.5rem 0; font-size: 0.85rem; font-family: monospace;
    }
    .recovery-codes {
      margin-top: 1rem; padding: 1rem; background: #fff8e1;
      border: 1px solid #ffecb3; border-radius: 4px;
    }
    .recovery-code { font-family: monospace; padding: 0.25rem 0; }
    .loading-inline { display: flex; align-items: center; gap: 0.5rem; color: #555; }
    .input-sm {
      padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px;
      font-size: 0.9rem; box-sizing: border-box;
    }
    .input-sm:focus { outline: none; border-color: #1976d2; }
    .input-flex { flex: 1; min-width: 200px; }
    .btn {
      padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem;
      cursor: pointer; border: none; font-weight: 500;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: #1976d2; color: white; }
    .btn-primary:hover { background: #1565c0; }
    .btn-danger { background: #dc2626; color: white; }
    .btn-danger:hover { background: #b91c1c; }
    .btn-outlined { background: transparent; color: #333; border: 1px solid #d1d5db; }
    .btn-outlined:hover { background: #f3f4f6; }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
    .apikey-form { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .key-display { display: block; margin-top: 0.5rem; font-size: 0.9rem; word-break: break-all; }
    .empty-text { color: #888; }
    .apikey-card {
      border: 1px solid #e5e7eb; padding: 0.75rem 1rem; margin-bottom: 0.5rem;
      border-radius: 6px; background: #fafafa;
    }
    .apikey-info { display: flex; justify-content: space-between; align-items: center; }
    .apikey-badge {
      font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 12px;
      background: #f3f4f6; color: #666; font-weight: 500;
    }
    .apikey-badge.active { background: #dcfce7; color: #166534; }
    .apikey-meta { font-size: 0.8rem; color: #888; margin: 0.25rem 0; }
    .apikey-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .spinner-small {
      width: 16px; height: 16px; border: 2px solid #e0e0e0;
      border-top: 2px solid #1976d2; border-radius: 50%;
      animation: spin 0.8s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SettingsComponent implements OnInit {
  private readonly mfaService = inject(MfaService);
  private readonly apiKeysService = inject(ApiKeysService);

  mfaLoading = signal(true);
  mfaEnabled = signal(false);
  setupData = signal<{ secret: string; qrCodeUrl: string } | null>(null);
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
