import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoanService } from '../../core/services/loan.service';
import { LoanApplicationResponse } from '../../core/models/loan.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header>
        <h2>Dashboard</h2>
        <div>
          <span>{{ user()?.firstName }} {{ user()?.lastName }}</span>

        </div>
      </header>
      <section>
        <div class="actions">
          <h3>My Applications</h3>
          <a routerLink="/loans/new">New Application</a>
        </div>
        @if (applications().length === 0) {
          <p>No applications yet. Start a new loan application.</p>
        }
        @for (app of applications(); track app.id) {
          <div class="card">
            <div><strong>{{ app.applicationNumber }}</strong></div>
            <div>Status: {{ app.status }}</div>
            <div>Amount: {{ app.loanAmount | currency }}</div>
            @if (app.vehicleMake) {
              <div>Vehicle: {{ app.vehicleYear }} {{ app.vehicleMake }} {{ app.vehicleModel }}</div>
            }
            <a [routerLink]="['/loans', app.id]">View Details</a>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 800px; margin: 2rem auto; padding: 1rem; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .card { border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; }
    button { padding: 0.5rem 1rem; cursor: pointer; }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly loanService = inject(LoanService);
  private readonly router = inject(Router);

  user = this.authService.currentUser;
  applications = signal<LoanApplicationResponse[]>([]);

  ngOnInit(): void {
    this.loanService.getApplications().subscribe({
      next: (apps) => this.applications.set(apps),
      error: () => this.applications.set([])
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
