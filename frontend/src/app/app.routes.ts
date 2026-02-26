import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup').then(m => m.SignupComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'dashboard/loan-officer', loadComponent: () => import('./features/dashboard/loan-officer-dashboard').then(m => m.LoanOfficerDashboardComponent), canActivate: [authGuard] },
  { path: 'dashboard/loan-officer/:id', loadComponent: () => import('./features/dashboard/loan-officer-detail').then(m => m.LoanOfficerDetailComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'loans/new', loadComponent: () => import('./features/loan/loan-form').then(m => m.LoanFormComponent), canActivate: [authGuard] },
  { path: 'loans/:id', loadComponent: () => import('./features/loan/loan-detail').then(m => m.LoanDetailComponent), canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
