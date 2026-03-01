import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiKeysService } from '../../core/services/api-keys.service';
import { ApiKeyResponse } from '../../core/models/api-key.model';

@Component({
  selector: 'app-api-keys-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="apikeys-container">
      <a routerLink="/profile">&larr; Back to Profile</a>
      <h2>API Keys</h2>
      <p>Manage your API keys for programmatic access.</p>

      <section class="create-section">
        <h3>Create New Key</h3>
        <div class="create-form">
          <div class="form-row">
            <label for="keyName">Key Name:</label>
            <input id="keyName" type="text" [(ngModel)]="newKeyName" placeholder="My API Key" />
          </div>
          <div class="form-row">
            <label for="keyExpiry">Expires At (optional):</label>
            <input id="keyExpiry" type="datetime-local" [(ngModel)]="newKeyExpiry" />
          </div>
          <button (click)="createKey()" [disabled]="!newKeyName.trim() || creating">
            {{ creating ? 'Creating...' : 'Create Key' }}
          </button>
        </div>
      </section>

      @if (newKeyValue) {
        <div class="new-key-alert">
          <strong>New API Key — copy now, it won't be shown again:</strong>
          <code>{{ newKeyValue }}</code>
        </div>
      }

      <section class="keys-list">
        <h3>Your Keys</h3>
        @if (loading()) {
          <p>Loading keys...</p>
        }

        @if (!loading() && apiKeys().length === 0) {
          <p>No API keys created yet.</p>
        }

        @for (key of apiKeys(); track key.id) {
          <div class="key-card">
            <div class="key-header">
              <strong>{{ key.name }}</strong>
              <span class="key-status" [class.active]="key.active">{{ key.active ? 'Active' : 'Revoked' }}</span>
            </div>
            <div class="key-meta">
              <span>Created: {{ key.createdAt }}</span>
              @if (key.expiresAt) {
                <span>Expires: {{ key.expiresAt }}</span>
              }
              @if (key.lastUsedAt) {
                <span>Last used: {{ key.lastUsedAt }}</span>
              }
            </div>
            <div class="key-actions">
              @if (key.active) {
                <button (click)="revokeKey(key.id)">Revoke</button>
              }
              <button class="delete" (click)="removeKey(key.id)">Delete</button>
            </div>
          </div>
        }
      </section>

      @if (errorMessage) {
        <div class="error">{{ errorMessage }}</div>
      }
    </div>
  `,
  styles: [`
    .apikeys-container { max-width: 700px; margin: 2rem auto; padding: 1rem; }
    .create-section { margin: 1.5rem 0; padding: 1.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .create-form .form-row { margin-bottom: 0.75rem; }
    .create-form label { display: block; margin-bottom: 0.25rem; }
    .create-form input { padding: 0.5rem; width: 100%; max-width: 300px; }
    .new-key-alert { background: #d4edda; padding: 1rem; border-radius: 4px; margin: 1rem 0; word-break: break-all; }
    .new-key-alert code { display: block; margin-top: 0.5rem; font-size: 0.95rem; background: #fff; padding: 0.5rem; border-radius: 4px; }
    .keys-list { margin-top: 1.5rem; }
    .key-card { border: 1px solid #eee; padding: 1rem; margin-bottom: 0.75rem; border-radius: 4px; }
    .key-header { display: flex; justify-content: space-between; align-items: center; }
    .key-status { font-size: 0.85rem; padding: 0.15rem 0.5rem; border-radius: 3px; background: #e9ecef; }
    .key-status.active { background: #d4edda; color: #155724; }
    .key-meta { display: flex; gap: 1rem; font-size: 0.8rem; color: #666; margin: 0.5rem 0; flex-wrap: wrap; }
    .key-actions { display: flex; gap: 0.5rem; }
    .delete { background: #dc3545; color: #fff; border: none; border-radius: 4px; }
    .error { color: red; margin-top: 1rem; }
    button { padding: 0.5rem 1rem; cursor: pointer; }
    button:disabled { opacity: 0.5; }
  `]
})
export class ApiKeysSettingsComponent implements OnInit {
  private readonly apiKeysService = inject(ApiKeysService);

  apiKeys = signal<ApiKeyResponse[]>([]);
  loading = signal(true);
  creating = false;
  newKeyName = '';
  newKeyExpiry = '';
  newKeyValue = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadKeys();
  }

  createKey(): void {
    if (!this.newKeyName.trim()) return;
    this.creating = true;
    this.errorMessage = '';
    this.newKeyValue = '';
    const request = {
      name: this.newKeyName,
      ...(this.newKeyExpiry ? { expiresAt: new Date(this.newKeyExpiry).toISOString() } : {})
    };
    this.apiKeysService.create(request).subscribe({
      next: (key) => {
        this.newKeyValue = key.key ?? '';
        this.apiKeys.update(keys => [key, ...keys]);
        this.newKeyName = '';
        this.newKeyExpiry = '';
        this.creating = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to create key';
        this.creating = false;
      }
    });
  }

  revokeKey(id: number): void {
    this.errorMessage = '';
    this.apiKeysService.revoke(id).subscribe({
      next: (updated) => this.apiKeys.update(keys => keys.map(k => k.id === id ? updated : k)),
      error: (err) => this.errorMessage = err.error?.message ?? 'Failed to revoke key'
    });
  }

  removeKey(id: number): void {
    this.errorMessage = '';
    this.apiKeysService.remove(id).subscribe({
      next: () => this.apiKeys.update(keys => keys.filter(k => k.id !== id)),
      error: (err) => this.errorMessage = err.error?.message ?? 'Failed to delete key'
    });
  }

  private loadKeys(): void {
    this.apiKeysService.list().subscribe({
      next: (keys) => {
        this.apiKeys.set(keys);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
