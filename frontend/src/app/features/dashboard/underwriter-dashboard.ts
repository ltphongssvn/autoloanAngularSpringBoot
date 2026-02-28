// frontend/src/app/features/dashboard/underwriter-dashboard.ts
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UnderwriterService } from '../../core/services/underwriter.service';
import { PaginatedResponse } from '../../core/services/loan-officer.service';
import { LoanApplicationResponse } from '../../core/models/loan.model';

@Component({
  selector: 'app-underwriter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="uw-layout">
      <header class="header-bar">
        <h2>Underwriter Dashboard</h2>
        <div class="header-right">
          <span class="welcome-text">Welcome, {{ user()?.firstName }}</span>
          <button class="btn btn-danger-outlined" (click)="logout()">&#10140; Logout</button>
        </div>
      </header>

      <div class="uw-content">
        <!-- Stats Cards -->
        <div class="stats-row">
          <div class="stat-card stat-review">
            <div class="stat-value">{{ statReview() }}</div>
            <div class="stat-label">Under Review</div>
          </div>
          <div class="stat-card stat-pending">
            <div class="stat-value">{{ statPending() }}</div>
            <div class="stat-label">Pending Docs</div>
          </div>
          <div class="stat-card stat-completed">
            <div class="stat-value">{{ statCompleted() }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filter-card">
          <div class="tabs">
            <button [class.active]="activeFilter() === ''" (click)="filterByStatus('')">All</button>
            <button [class.active]="activeFilter() === 'IN_REVIEW'" (click)="filterByStatus('IN_REVIEW')">In Review</button>
            <button [class.active]="activeFilter() === 'VERIFYING'" (click)="filterByStatus('VERIFYING')">Verifying</button>
            <button [class.active]="activeFilter() === 'PENDING_DOCUMENTS'" (click)="filterByStatus('PENDING_DOCUMENTS')">Pending Docs</button>
            <button [class.active]="activeFilter() === 'APPROVED'" (click)="filterByStatus('APPROVED')">Approved</button>
            <button [class.active]="activeFilter() === 'REJECTED'" (click)="filterByStatus('REJECTED')">Rejected</button>
          </div>
          <div class="filter-row">
            <div class="filter-group">
              <label for="riskFilter">Risk Level</label>
              <select id="riskFilter" [(ngModel)]="riskFilter">
                <option value="all">All Risk</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
            <div class="filter-group">
              <label for="amountFilter">Amount</label>
              <select id="amountFilter" [(ngModel)]="amountFilter">
                <option value="all">All Amounts</option>
                <option value="under25k">Under $25k</option>
                <option value="25k-50k">$25k - $50k</option>
                <option value="over50k">Over $50k</option>
              </select>
            </div>
            <span class="summary-text">Total: {{ total() }} &middot; Page {{ page() }} of {{ totalPages() || 1 }}</span>
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
                  <th>DTI</th>
                  <th>LTV</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (app of filteredDisplayApps(); track app.id) {
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
                    <td>{{ computeDti(app) }}%</td>
                    <td>{{ computeLtv(app) }}%</td>
                    <td><span class="risk-dot" [class]="'risk-' + computeRisk(app)">&#9679;</span> {{ computeRisk(app) | titlecase }}</td>
                    <td><span class="tag" [class]="'status-' + app.status.toLowerCase()">{{ formatStatus(app.status) }}</span></td>
                    <td><a class="view-link" [routerLink]="['/dashboard/underwriter', app.id]">Analyze</a></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Risk Legend -->
          <div class="risk-legend">
            <span>Risk:</span>
            <span class="risk-dot risk-low">&#9679;</span> Low
            <span class="risk-dot risk-medium">&#9679;</span> Medium
            <span class="risk-dot risk-high">&#9679;</span> High
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
    .uw-layout { min-height: 100vh; background: #f5f5f5; }
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
    .uw-content { max-width: 1000px; margin: 0 auto; padding: 1.5rem 1rem; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { padding: 1.25rem; border-radius: 8px; }
    .stat-review { background: #e0e7ff; border: 1px solid #c7d2fe; }
    .stat-pending { background: #fef3c7; border: 1px solid #fde68a; }
    .stat-completed { background: #d1fae5; border: 1px solid #a7f3d0; }
    .stat-value { font-size: 1.75rem; font-weight: 700; color: #333; }
    .stat-label { font-size: 0.9rem; font-weight: 600; color: #555; }
    .filter-card { background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 1.25rem; overflow: hidden; }
    .tabs { display: flex; border-bottom: 1px solid #e5e7eb; overflow-x: auto; }
    .tabs button {
      padding: 0.65rem 1rem; border: none; background: transparent; cursor: pointer;
      font-size: 0.85rem; font-weight: 500; color: #555; border-bottom: 2px solid transparent; white-space: nowrap;
    }
    .tabs button.active { color: #6f42c1; border-bottom-color: #6f42c1; }
    .tabs button:hover { background: #f5f5f5; }
    .filter-row { padding: 0.75rem 1rem; display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .filter-group label { font-size: 0.8rem; color: #666; font-weight: 500; }
    .filter-group select { padding: 0.4rem 0.6rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.85rem; background: #fff; }
    .summary-text { font-size: 0.8rem; color: #888; white-space: nowrap; margin-left: auto; }
    .loading-state { text-align: center; padding: 3rem; }
    .loading-state p { color: #555; margin-top: 1rem; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #e0e0e0;
      border-top: 3px solid #6f42c1; border-radius: 50%;
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
    .status-in_review { background: #e0e7ff; color: #3730a3; }
    .status-verifying { background: #d1e7dd; color: #0f5132; }
    .status-pending_documents { background: #fef9c3; color: #854d0e; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .risk-dot { font-size: 0.9rem; margin-right: 0.25rem; }
    .risk-low { color: #10b981; }
    .risk-medium { color: #f59e0b; }
    .risk-high { color: #ef4444; }
    .risk-legend { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.75rem; font-size: 0.85rem; color: #555; }
    .view-link { color: #6f42c1; text-decoration: none; font-weight: 500; font-size: 0.85rem; }
    .view-link:hover { text-decoration: underline; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.25rem; }
  `]
})
export class UnderwriterDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly underwriterService = inject(UnderwriterService);
  private readonly router = inject(Router);

  user = this.authService.currentUser;
  applications = signal<LoanApplicationResponse[]>([]);
  loading = signal(false);
  activeFilter = signal('');
  page = signal(1);
  total = signal(0);
  totalPages = signal(0);
  riskFilter = 'all';
  amountFilter = 'all';

  statReview = computed(() => this.applications().filter(a => a.status === 'IN_REVIEW' || a.status === 'UNDER_REVIEW').length);
  statPending = computed(() => this.applications().filter(a => a.status === 'PENDING_DOCUMENTS').length);
  statCompleted = computed(() => this.applications().filter(a => a.status === 'APPROVED' || a.status === 'REJECTED').length);

  filteredDisplayApps = computed(() => {
    let apps = this.applications();
    if (this.riskFilter !== 'all') {
      apps = apps.filter(a => this.computeRisk(a) === this.riskFilter);
    }
    if (this.amountFilter === 'under25k') apps = apps.filter(a => (a.loanAmount ?? 0) < 25000);
    else if (this.amountFilter === '25k-50k') apps = apps.filter(a => (a.loanAmount ?? 0) >= 25000 && (a.loanAmount ?? 0) <= 50000);
    else if (this.amountFilter === 'over50k') apps = apps.filter(a => (a.loanAmount ?? 0) > 50000);
    return apps;
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

  computeDti(app: LoanApplicationResponse): number {
    const income = (app as unknown as Record<string, number>)['annualIncome'] as number || 0;
    const amount = app.loanAmount || 0;
    const term = app.loanTerm || 48;
    const rate = 6.9 / 100 / 12;
    if (amount <= 0 || income <= 0) return 0;
    const monthly = (amount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    return Math.round(((monthly * 12) / income) * 100);
  }

  computeLtv(app: LoanApplicationResponse): number {
    const amount = app.loanAmount || 0;
    const down = (app as unknown as Record<string, number>)['downPayment'] as number || 0;
    const price = ((app as unknown as Record<string, number>)['vehiclePrice'] as number) || amount;
    if (price <= 0) return 0;
    return Math.round(((amount - down) / price) * 100);
  }

  computeRisk(app: LoanApplicationResponse): string {
    const dti = this.computeDti(app);
    const ltv = this.computeLtv(app);
    if (dti > 40 || ltv > 90) return 'high';
    if (dti > 30 || ltv > 80) return 'medium';
    return 'low';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private loadApplications(): void {
    this.loading.set(true);
    this.underwriterService.list({
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
