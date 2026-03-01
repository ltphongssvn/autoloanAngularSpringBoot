import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <a routerLink="/dashboard">AutoLoan</a>
      </div>

      @if (authService.isAuthenticated()) {
        <div class="nav-links">
          <a [routerLink]="dashboardLink()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>

          @if (authService.userRole() === 'LOAN_OFFICER') {
            <a routerLink="/dashboard/loan-officer" routerLinkActive="active">Officer Queue</a>
          }

          @if (authService.userRole() === 'UNDERWRITER') {
            <a routerLink="/dashboard/underwriter" routerLinkActive="active">Underwriter Queue</a>
          }

          @if (authService.userRole() === 'CUSTOMER') {
            <a routerLink="/loans/new" routerLinkActive="active">New Application</a>
          }

          <a routerLink="/profile" routerLinkActive="active">Profile</a>
          <a routerLink="/dashboard/settings" routerLinkActive="active">Settings</a>
        </div>

        <div class="nav-user">
          <span class="user-name">{{ authService.currentUser()?.firstName }}</span>
          <span class="user-role">{{ authService.userRole() }}</span>
          <button (click)="logout()">Logout</button>
        </div>
      } @else {
        <div class="nav-links">
          <a routerLink="/login" routerLinkActive="active">Login</a>
          <a routerLink="/signup" routerLinkActive="active">Sign Up</a>
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.5rem; background: #1a1a2e; color: #fff; }
    .nav-brand a { color: #fff; text-decoration: none; font-size: 1.25rem; font-weight: bold; }
    .nav-links { display: flex; gap: 1rem; align-items: center; }
    .nav-links a { color: #ccc; text-decoration: none; padding: 0.4rem 0.75rem; border-radius: 4px; transition: background 0.2s; }
    .nav-links a:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .nav-links a.active { background: rgba(255,255,255,0.15); color: #fff; font-weight: 500; }
    .nav-user { display: flex; align-items: center; gap: 0.75rem; }
    .user-name { font-weight: 500; }
    .user-role { font-size: 0.8rem; background: rgba(255,255,255,0.15); padding: 0.15rem 0.5rem; border-radius: 3px; }
    button { padding: 0.4rem 0.8rem; border: 1px solid #ccc; background: transparent; color: #ccc; border-radius: 4px; cursor: pointer; }
    button:hover { background: rgba(255,255,255,0.1); color: #fff; }
  `]
})
export class NavigationComponent {
  readonly authService = inject(AuthService);
  readonly dashboardLink = computed(() => {
    const role = this.authService.userRole();
    if (role === 'LOAN_OFFICER') return '/dashboard/loan-officer';
    if (role === 'UNDERWRITER') return '/dashboard/underwriter';
    return '/dashboard';
  });
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
