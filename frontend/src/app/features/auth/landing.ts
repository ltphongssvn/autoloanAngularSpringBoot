// frontend/src/app/features/auth/landing.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaymentCalculatorComponent } from '../../shared/payment-calculator';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, PaymentCalculatorComponent],
  template: `
    <div class="landing">
      <!-- Nav Bar -->
      <nav class="navbar">
        <span class="nav-brand">Auto Loan</span>
        <a routerLink="/login" class="btn btn-outlined-white">Login</a>
      </nav>

      <!-- Hero Section -->
      <div class="hero">
        <h1>Get Your Auto Loan in 15 Minutes</h1>
        <p class="hero-sub">Fast online approval with minimal documentation. Drive away in your new car today.</p>
        <a routerLink="/signup" class="btn btn-white">Apply Now</a>
      </div>

      <!-- Calculator Section -->
      <div class="calculator-section">
        <app-payment-calculator></app-payment-calculator>
        <div class="cta-below">
          <a routerLink="/signup" class="btn btn-primary btn-lg">Apply Now</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
    }
    .nav-brand { color: white; font-size: 1.25rem; font-weight: 700; }
    .btn-outlined-white {
      color: white;
      border: 1px solid white;
      background: transparent;
      padding: 0.5rem 1.25rem;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.95rem;
      transition: background 0.2s;
    }
    .btn-outlined-white:hover { background: rgba(255,255,255,0.1); }
    .hero {
      text-align: center;
      color: white;
      padding: 4rem 1.5rem 3rem;
      max-width: 700px;
      margin: 0 auto;
    }
    .hero h1 { font-size: 2.75rem; font-weight: 700; margin: 0 0 1rem; line-height: 1.2; }
    .hero-sub { font-size: 1.15rem; opacity: 0.9; margin-bottom: 2rem; }
    .btn-white {
      display: inline-block;
      background: white;
      color: #667eea;
      padding: 0.875rem 2rem;
      border-radius: 4px;
      font-size: 1.1rem;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-white:hover { background: #f0f0f0; }
    .calculator-section {
      max-width: 500px;
      margin: 0 auto;
      padding: 0 1.5rem 3rem;
    }
    :host ::ng-deep .calculator-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      border: none;
      padding: 2rem;
    }
    :host ::ng-deep .calculator-container h3 {
      text-align: center;
      font-size: 1.35rem;
      margin-bottom: 1.25rem;
      color: #333;
    }
    .cta-below { text-align: center; margin-top: 1.25rem; }
    .btn-primary {
      display: inline-block;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      cursor: pointer;
    }
    .btn-lg { padding: 0.875rem 2rem; font-size: 1.1rem; font-weight: 600; width: 100%; text-align: center; }
    .btn-primary:hover { background: #1565c0; }
  `]
})
export class LandingComponent {}
