// frontend/src/app/features/dashboard/loan-officer-dashboard.ts
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LoanOfficerService, PaginatedResponse } from '../../core/services/loan-officer.service';
import { LoanApplicationResponse } from '../../core/models/loan.model';

@Component({
  selector: 'app-loan-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="lo-layout">
      <header class="header-bar">
        <h2>Officer Dashboard</h2>
        <div class="header-right">
          <span class="welcome-text">Welcome, {{ user()?.firstName }}</span>
          <button class="btn btn-danger-outlined" (click)="logout()">&#10140; Logout</button>
        </div>
      </header>

      <div class="lo-content">
        <!-- Stats Cards -->
        <div class="stats-row">
          <div class="stat-card stat-review">
            <div class="stat-value">{{ statReview() }}</div>
            <div class="stat-label">Pending Review</div>
          </div>
          <div class="stat-card stat-new">
            <div class="stat-value">{{ statSubmitted() }}</div>
            <div class="stat-label">New Applications</div>
          </div>
          <div class="stat-card stat-verify">
            <div class="stat-value">{{ statVerifying() }}</div>
            <div class="stat-label">Verifying</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filter-card">
          <div class="tabs">
            <button [class.active]="activeFilter() === ''" (click)="filterByStatus('')">All</button>
            <button [class.active]="activeFilter() === 'SUBMITTED'" (click)="filterByStatus('SUBMITTED')">New</button>
            <button [class.active]="activeFilter() === 'VERIFYING'" (click)="filterByStatus('VERIFYING')">Verifying</button>
            <button [class.active]="activeFilter() === 'IN_REVIEW'" (click)="filterByStatus('IN_REVIEW')">In Review</button>
            <button [class.active]="activeFilter() === 'PENDING_DOCUMENTS'" (click)="filterByStatus('PENDING_DOCUMENTS')">Pending Docs</button>
            <button [class.active]="activeFilter() === 'APPROVED'" (click)="filterByStatus('APPROVED')">Approved</button>
            <button [class.active]="activeFilter() === 'REJECTED'" (click)="filterByStatus('REJECTED')">Rejected</button>
          </div>
          <div class="search-row">
            <input type="text" [(ngModel)]="searchTerm" placeholder="Search by name or ID..." class="search-input" />
            <span class="summary-text">Total: {{ total() }} applications &middot; Page {{ page() }} of {{ totalPages() || 1 }}</span>
          </div>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading applications...</p>
          </div>
        }

        <!-- Empty -->
        @if (!loading() && applications().length === 0) {
          <div class="empty-state">No applications found.</div>
        }

        <!-- Table -->
        @if (!loading() && applications().length > 0) {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (app of filteredApps(); track app.id) {
                  <tr>
                    <td><strong>{{ app.applicationNumber }}</strong></td>
                    <td>
                      @if (app.vehicleMake) {
                        {{ app.vehicleYear }} {{ app.vehicleMake }} {{ app.vehicleModel }}
                      } @else {
                        <span class="muted">—</span>
                      }
                    </td>
                    <td>{{ app.loanAmount | currency:'USD':'symbol':'1.0-0' }}</td>
                    <td><span class="tag" [class]="'status-' + app.status.toLowerCase()">{{ formatStatus(app.status) }}</span></td>
                    <td><a class="view-link" [routerLink]="['/dashboard/loan-officer', app.id]">View</a></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="btn btn-sm btn-outlined" [disabled]="page() <= 1" (click)="goToPage(page() - 1)">← Previous</button>
            <span>Page {{ page() }} of {{ totalPages() }}</span>
            <button class="btn btn-sm btn-outlined" [disabled]="page() >= totalPages()" (click)="goToPage(page() + 1)">Next →</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .lo-layout { min-height: 100vh; background: #f5f5f5; }
    .header-bar {
      background: white; border-bottom: 1px solid #e5e7eb;
      padding: 0.875rem 2rem; display: flex; justify-content: space-between; align-items: center;
    }
    .header-bar h2 { margin: 0; font-size: 1.35rem; color: #333; }
    .header-right { display: flex; align-items: center; gap: 1rem; }
    .welcome-text { font-size: 0.9rem; color: #555; }
    .btn { padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.9rem; cursor: pointer; border: none; font-weight: 500; }
    .btn-danger-outlined { background: transparent; color: #dc2626; border: 1px solid #fca5a5; }
    .btn-danger-outlined:hover { background: #fef2f2; }
    .btn-outlined { background: transparent; color: #333; border: 1px solid #d1d5db; }
    .btn-outlined:hover { background: #f3f4f6; }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.85rem; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .lo-content { max-width: 960px; margin: 0 auto; padding: 1.5rem 1rem; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { padding: 1.25rem; border-radius: 8px; }
    .stat-review { background: #fff3cd; border: 1px solid #ffe69c; }
    .stat-new { background: #cfe2ff; border: 1px solid #9ec5fe; }
    .stat-verify { background: #d1e7dd; border: 1px solid #a3cfbb; }
    .stat-value { font-size: 1.75rem; font-weight: 700; color: #333; }
    .stat-label { font-size: 0.9rem; font-weight: 600; color: #555; }
    .filter-card { background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 1.25rem; overflow: hidden; }
    .tabs { display: flex; border-bottom: 1px solid #e5e7eb; overflow-x: auto; }
    .tabs button {
      padding: 0.65rem 1rem; border: none; background: transparent; cursor: pointer;
      font-size: 0.85rem; font-weight: 500; color: #555; border-bottom: 2px solid transparent; white-space: nowrap;
    }
    .tabs button.active { color: #1976d2; border-bottom-color: #1976d2; }
    .tabs button:hover { background: #f5f5f5; }
    .search-row { padding: 0.75rem 1rem; display: flex; align-items: center; gap: 1rem; }
    .search-input {
      flex: 1; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.9rem;
    }
    .search-input:focus { outline: none; border-color: #1976d2; }
    .summary-text { font-size: 0.8rem; color: #888; white-space: nowrap; }
    .loading-state { text-align: center; padding: 3rem; }
    .loading-state p { color: #555; margin-top: 1rem; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #e0e0e0;
      border-top: 3px solid #1976d2; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 3rem; background: white; border-radius: 8px; color: #888; }
    .table-wrapper { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f9fafb; }
    th { text-align: left; padding: 0.75rem 1rem; font-size: 0.8rem; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.03em; }
    td { padding: 0.75rem 1rem; border-top: 1px solid #f0f0f0; font-size: 0.9rem; }
    tr:hover { background: #fafafa; }
    .muted { color: #bbb; }
    .tag { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 12px; font-weight: 500; }
    .status-draft { background: #f3f4f6; color: #374151; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .status-verifying { background: #d1e7dd; color: #0f5132; }
    .status-in_review { background: #e0e7ff; color: #3730a3; }
    .status-pending_documents { background: #fef9c3; color: #854d0e; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-signed { background: #d1fae5; color: #065f46; }
    .view-link { color: #1976d2; text-decoration: none; font-weight: 500; font-size: 0.85rem; }
    .view-link:hover { text-decoration: underline; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.25rem; }
  `]
})
export class LoanOfficerDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly loanOfficerService = inject(LoanOfficerService);
  private readonly router = inject(Router);

  user = this.authService.currentUser;
  applications = signal<LoanApplicationResponse[]>([]);
  loading = signal(false);
  activeFilter = signal('');
  page = signal(1);
  total = signal(0);
  totalPages = signal(0);
  searchTerm = '';

  // Stats computed from current page data
  statSubmitted = computed(() => this.applications().filter(a => a.status === 'SUBMITTED').length);
  statReview = computed(() => this.applications().filter(a => a.status === 'IN_REVIEW' || a.status === 'UNDER_REVIEW').length);
  statVerifying = computed(() => this.applications().filter(a => a.status === 'VERIFYING' || a.status === 'PENDING').length);

  // Client-side search filter
  filteredApps = computed(() => {
    const term = this.searchTerm?.toLowerCase().trim();
    if (!term) return this.applications();
    return this.applications().filter(a =>
      a.applicationNumber?.toLowerCase().includes(term) ||
      a.vehicleMake?.toLowerCase().includes(term) ||
      a.vehicleModel?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadApplications();
  }

  filterByStatus(status: string): void {
    this.activeFilter.set(status);
    this.page.set(1);
    this.loadApplications();
  }

  goToPage(pageNum: number): void {
    this.page.set(pageNum);
    this.loadApplications();
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private loadApplications(): void {
    this.loading.set(true);
    this.loanOfficerService.list({
      status: this.activeFilter() || undefined,
      page: this.page(),
      perPage: 20
    }).subscribe({
      next: (res: PaginatedResponse<LoanApplicationResponse>) => {
        this.applications.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.applications.set([]);
        this.loading.set(false);
      }
    });
  }
}
