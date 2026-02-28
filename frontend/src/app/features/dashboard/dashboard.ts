// frontend/src/app/features/dashboard/dashboard.ts
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LoanService } from '../../core/services/loan.service';
import { LoanApplicationResponse } from '../../core/models/loan.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="dashboard-layout">
      <!-- Header Bar -->
      <header class="header-bar">
        <h2>Customer Dashboard</h2>
        <div class="header-actions">
          <a routerLink="/dashboard/settings" class="btn btn-outlined">
            &#9881; Settings
          </a>
          <button class="btn btn-danger-outlined" (click)="logout()">
            &#10140; Logout
          </button>
        </div>
      </header>

      <div class="dashboard-content">
        <div class="welcome">
          <p class="greeting">Welcome back, {{ user()?.firstName || 'User' }}!</p>
        </div>

        <section>
          <div class="actions">
            <h3>My Applications</h3>
            <a class="btn btn-primary" routerLink="/loans/new">+ New Application</a>
          </div>

          <div class="filters">
            <div class="filter-group">
              <label for="statusFilter">Filter by Status</label>
              <select id="statusFilter" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="PENDING_DOCUMENTS">Pending Documents</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="SIGNED">Signed</option>
              </select>
            </div>
            <div class="filter-group">
              <label for="sortBy">Sort By</label>
              <select id="sortBy" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="alert alert-error">{{ errorMessage() }}</div>
          }

          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading applications...</p>
            </div>
          }

          @if (!loading() && filteredApplications().length === 0) {
            <div class="empty-state">
              <p class="empty-title">No applications found</p>
              <p class="empty-sub">{{ statusFilter() ? 'Try changing your filter settings' : 'Start your first loan application today!' }}</p>
              @if (!statusFilter()) {
                <a class="btn btn-primary" routerLink="/loans/new">Create Application</a>
              }
            </div>
          }

          @if (!loading()) {
            <div class="grid">
              @for (app of filteredApplications(); track app.id) {
                <div class="card" [class.approved]="app.status === 'APPROVED'" [class.rejected]="app.status === 'REJECTED'">
                  <div class="card-header">
                    <div class="app-title">
                      <strong>{{ app.applicationNumber }}</strong>
                      @if (app.status === 'DRAFT') {
                        <span class="tag incomplete">(Incomplete)</span>
                      }
                    </div>
                    <span class="tag status" [class]="'status-' + app.status.toLowerCase()">{{ formatStatus(app.status) }}</span>
                  </div>
                  @if (app.vehicleMake) {
                    <div class="vehicle">{{ app.vehicleMake }} {{ app.vehicleModel }} {{ app.vehicleYear }}</div>
                  }
                  <div class="details">
                    @if (app.loanAmount) {
                      <span>{{ app.loanAmount | currency:'USD':'symbol':'1.0-0' }}</span>
                    }
                    @if (app.loanTerm) {
                      <span> | {{ app.loanTerm }} months</span>
                    }
                  </div>
                  <div class="date">
                    @if (app.status === 'DRAFT') {
                      Last saved: {{ app.updatedAt | date:'M/d/yyyy' }}
                    } @else {
                      Created: {{ app.createdAt | date:'M/d/yyyy' }}
                    }
                  </div>
                  <div class="card-actions">
                    @if (app.status === 'DRAFT') {
                      <button class="btn-delete" (click)="deleteApp(app.id)" title="Delete">&#128465;</button>
                    }
                    <a class="view-link" [routerLink]="app.status === 'APPROVED' ? ['/dashboard/applications', app.id, 'agreement'] : ['/loans', app.id]">View</a>
                  </div>
                </div>
              }
            </div>
          }
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { min-height: 100vh; background: #f5f5f5; }
    .header-bar {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 0.875rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-bar h2 { margin: 0; font-size: 1.35rem; color: #333; }
    .header-actions { display: flex; gap: 0.5rem; }
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      border: none;
      font-weight: 500;
    }
    .btn-primary { background: #1976d2; color: white; }
    .btn-primary:hover { background: #1565c0; }
    .btn-outlined { background: transparent; color: #333; border: 1px solid #d1d5db; }
    .btn-outlined:hover { background: #f3f4f6; }
    .btn-danger-outlined { background: transparent; color: #dc2626; border: 1px solid #fca5a5; }
    .btn-danger-outlined:hover { background: #fef2f2; }
    .dashboard-content { max-width: 960px; margin: 0 auto; padding: 1.5rem 1rem; }
    .welcome { margin-bottom: 1.5rem; }
    .greeting { color: #555; margin: 0; font-size: 1.1rem; }
    .actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .actions h3 { margin: 0; font-size: 1.2rem; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .filter-group label { font-size: 0.8rem; color: #666; font-weight: 500; }
    .filter-group select {
      padding: 0.4rem 0.6rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.85rem;
      background: #fff;
    }
    .alert { padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem; }
    .alert-error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .loading-state { text-align: center; padding: 3rem 1rem; }
    .loading-state p { color: #555; margin-top: 1rem; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #e0e0e0;
      border-top: 3px solid #1976d2; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state {
      text-align: center; padding: 3rem 1rem; background: #fff;
      border: 1px solid #e5e7eb; border-radius: 8px;
    }
    .empty-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 0.5rem; }
    .empty-sub { color: #888; margin: 0 0 1rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
    .card {
      border: 1px solid #e5e7eb; padding: 1rem 1.25rem; border-radius: 8px; background: #fff;
      transition: box-shadow 0.15s; display: flex; flex-direction: column;
    }
    .card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .card.approved { border-left: 4px solid #16a34a; }
    .card.rejected { border-left: 4px solid #dc2626; }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem; }
    .app-title { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .app-title strong { font-size: 1rem; }
    .tag { font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 12px; font-weight: 500; }
    .tag.incomplete { background: #fef3c7; color: #92400e; }
    .status-draft { background: #f3f4f6; color: #374151; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .status-under_review { background: #e0e7ff; color: #3730a3; }
    .status-pending_documents { background: #fef9c3; color: #854d0e; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-signed { background: #d1fae5; color: #065f46; }
    .vehicle { font-size: 0.9rem; color: #374151; margin-bottom: 0.25rem; }
    .details { font-size: 0.9rem; color: #555; margin-bottom: 0.25rem; }
    .date { font-size: 0.8rem; color: #888; margin-bottom: 0.5rem; }
    .card-actions { display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; margin-top: auto; }
    .btn-delete {
      background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #dc2626;
      padding: 0.25rem; border-radius: 4px; line-height: 1;
    }
    .btn-delete:hover { background: #fee2e2; }
    .view-link { font-size: 0.85rem; color: #2563eb; text-decoration: none; font-weight: 500; }
    .view-link:hover { text-decoration: underline; }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly loanService = inject(LoanService);
  private readonly router = inject(Router);

  user = this.authService.currentUser;
  applications = signal<LoanApplicationResponse[]>([]);
  statusFilter = signal('');
  sortBy = signal('newest');
  loading = signal(false);
  errorMessage = signal('');

  filteredApplications = computed(() => {
    let apps = [...this.applications()];
    const filter = this.statusFilter();
    if (filter) {
      apps = apps.filter(a => a.status === filter);
    }
    const sort = this.sortBy();
    apps.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sort === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return apps;
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.loanService.getApplications().subscribe({
      next: (apps) => {
        this.applications.set(apps);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Failed to load applications');
        this.applications.set([]);
        this.loading.set(false);
      }
    });
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  deleteApp(id: number): void {
    if (!confirm('Delete this application?')) return;
    this.loanService.deleteApplication(id).subscribe({
      next: () => this.applications.update(apps => apps.filter(a => a.id !== id)),
      error: () => alert('Failed to delete application')
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
