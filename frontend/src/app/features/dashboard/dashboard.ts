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
    <div class="dashboard">
      <div class="welcome">
        <h2>Customer Dashboard</h2>
        <p class="greeting">Welcome back, {{ user()?.firstName }}!</p>
      </div>

      <section>
        <div class="actions">
          <h3>My Applications</h3>
          <a class="btn-new" routerLink="/loans/new">New Application</a>
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

        @if (filteredApplications().length === 0) {
          <div class="empty-state">
            <p class="empty-title">No applications found</p>
            <p class="empty-sub">{{ statusFilter() ? 'Try changing your filter settings' : 'Start your first loan application today!' }}</p>
            @if (!statusFilter()) {
              <a class="btn-new" routerLink="/loans/new">Create Application</a>
            }
          </div>
        }

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
                <a class="view-link" [routerLink]="['/loans', app.id]">View</a>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
    .welcome { margin-bottom: 1.5rem; }
    .welcome h2 { margin: 0 0 0.25rem; font-size: 1.5rem; }
    .greeting { color: #555; margin: 0; font-size: 1.1rem; }
    .actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .actions h3 { margin: 0; font-size: 1.2rem; }
    .btn-new {
      background: #2563eb; color: #fff; padding: 0.5rem 1rem; border-radius: 6px;
      text-decoration: none; font-size: 0.9rem; font-weight: 500; display: inline-block;
    }
    .btn-new:hover { background: #1d4ed8; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .filter-group label { font-size: 0.8rem; color: #666; font-weight: 500; }
    .filter-group select {
      padding: 0.4rem 0.6rem; border: 1px solid #d1d5db; border-radius: 6px;
      font-size: 0.85rem; background: #fff;
    }
    .empty-state { text-align: center; padding: 3rem 1rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
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
    .view-link {
      font-size: 0.85rem; color: #2563eb; text-decoration: none; font-weight: 500;
    }
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
    this.loanService.getApplications().subscribe({
      next: (apps) => this.applications.set(apps),
      error: () => this.applications.set([])
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
