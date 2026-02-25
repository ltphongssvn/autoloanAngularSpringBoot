import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup').then(m => m.SignupComponent) },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
