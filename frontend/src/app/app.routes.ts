import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup').then(m => m.SignupComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
