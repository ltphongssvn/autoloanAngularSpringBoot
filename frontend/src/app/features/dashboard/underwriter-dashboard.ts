import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UnderwriterService } from '../../core/services/underwriter.service';
import { PaginatedResponse } from '../../core/services/loan-officer.service';
import { LoanApplicationResponse } from '../../core/models/loan.model';

@Component({
  selector: 'app-underwriter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header>
        <h2>Underwriter Dashboard</h2>
        <div>
          <span>{{ user()?.firstName }} {{ user()?.lastName }}</span>
          <button (click)="logout()">Logout</button>
        </div>
      </header>

      <section class="filters">
        <button [class.active]="activeFilter() === ''" (click)="filterByStatus('')">All</button>
        <button [class.active]="activeFilter() === 'IN_REVIEW'" (click)="filterByStatus('IN_REVIEW')">In Review</button>
        <button [class.active]="activeFilter() === 'VERIFYING'" (click)="filterByStatus('VERIFYING')">Verifying</button>
        <button [class.active]="activeFilter() === 'APPROVED'" (click)="filterByStatus('APPROVED')">Approved</button>
        <button [class.active]="activeFilter() === 'REJECTED'" (click)="filterByStatus('REJECTED')">Rejected</button>
      </section>

      <section class="summary">
        <span>Total: {{ total() }} applications</span>
        <span>Page {{ page() }} of {{ totalPages() }}</span>
      </section>

      <section>
        @if (loading()) {
          <p>Loading applications...</p>
        }

        @if (!loading() && applications().length === 0) {
          <p>No applications found.</p>
        }

        @for (app of applications(); track app.id) {
          <div class="card">
            <div class="card-header">
              <strong>{{ app.applicationNumber }}</strong>
              <span class="status" [attr.data-status]="app.status">{{ app.status }}</span>
            </div>
            <div>Amount: {{ app.loanAmount | currency }}</div>
            @if (app.vehicleMake) {
              <div>Vehicle: {{ app.vehicleYear }} {{ app.vehicleMake }} {{ app.vehicleModel }}</div>
            }
            <div class="card-actions">
              <a [routerLink]="['/dashboard/underwriter', app.id]">Review</a>
            </div>
          </div>
        }
      </section>

      @if (totalPages() > 1) {
        <section class="pagination">
          <button [disabled]="page() <= 1" (click)="goToPage(page() - 1)">Previous</button>
          <span>Page {{ page() }} of {{ totalPages() }}</span>
          <button [disabled]="page() >= totalPages()" (click)="goToPage(page() + 1)">Next</button>
        </section>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 900px; margin: 2rem auto; padding: 1rem; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .filters { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .filters button { padding: 0.4rem 0.8rem; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
    .filters button.active { background: #6f42c1; color: #fff; border-color: #6f42c1; }
    .summary { display: flex; justify-content: space-between; margin-bottom: 1rem; color: #666; font-size: 0.9rem; }
    .card { border: 1px solid #ddd; padding: 1rem; margin-bottom: 0.75rem; border-radius: 4px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .status { padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.85rem; background: #e9ecef; }
    .card-actions { margin-top: 0.5rem; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1rem; }
    button { padding: 0.5rem 1rem; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
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
