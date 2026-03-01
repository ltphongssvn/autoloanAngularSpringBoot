// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/auth/landing').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup').then(m => m.SignupComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password').then(m => m.ResetPasswordComponent) },
  { path: 'confirm-email', loadComponent: () => import('./features/auth/confirm-email').then(m => m.ConfirmEmailComponent) },
  { path: 'account-locked', loadComponent: () => import('./features/auth/account-locked').then(m => m.AccountLockedComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'dashboard/settings', loadComponent: () => import('./features/dashboard/settings').then(m => m.SettingsComponent), canActivate: [authGuard] },
  { path: 'dashboard/profile/mfa', loadComponent: () => import('./features/dashboard/mfa-settings').then(m => m.MfaSettingsComponent), canActivate: [authGuard] },
  { path: 'dashboard/profile/api-keys', loadComponent: () => import('./features/dashboard/api-keys-settings').then(m => m.ApiKeysSettingsComponent), canActivate: [authGuard] },
  { path: 'dashboard/loan-officer', loadComponent: () => import('./features/dashboard/loan-officer-dashboard').then(m => m.LoanOfficerDashboardComponent), canActivate: [authGuard] },
  { path: 'dashboard/loan-officer/:id', loadComponent: () => import('./features/dashboard/loan-officer-detail').then(m => m.LoanOfficerDetailComponent), canActivate: [authGuard] },
  { path: 'dashboard/underwriter', loadComponent: () => import('./features/dashboard/underwriter-dashboard').then(m => m.UnderwriterDashboardComponent), canActivate: [authGuard] },
  { path: 'dashboard/underwriter/:id', loadComponent: () => import('./features/dashboard/underwriter-detail').then(m => m.UnderwriterDetailComponent), canActivate: [authGuard] },
  { path: 'dashboard/applications/:id/agreement', loadComponent: () => import('./features/loan/agreement').then(m => m.AgreementComponent), canActivate: [authGuard] },
  { path: 'dashboard/applications/:id/status', loadComponent: () => import('./features/loan/status').then(m => m.StatusComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'loans/new', loadComponent: () => import('./features/loan/loan-form').then(m => m.LoanFormComponent), canActivate: [authGuard] },
  { path: 'loans/:id', loadComponent: () => import('./features/loan/loan-detail').then(m => m.LoanDetailComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
