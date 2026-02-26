import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calculator-container">
      <h3>Payment Calculator</h3>

      <div class="calc-form">
        <div class="form-group">
          <label for="calcLoanAmount">Loan Amount ($)</label>
          <input id="calcLoanAmount" type="number" [ngModel]="loanAmount()" (ngModelChange)="loanAmount.set($event)" min="0" step="1000" />
        </div>
        <div class="form-group">
          <label for="calcDownPayment">Down Payment ($)</label>
          <input id="calcDownPayment" type="number" [ngModel]="downPayment()" (ngModelChange)="downPayment.set($event)" min="0" step="500" />
        </div>
        <div class="form-group">
          <label for="calcInterestRate">Interest Rate (%)</label>
          <input id="calcInterestRate" type="number" [ngModel]="interestRate()" (ngModelChange)="interestRate.set($event)" min="0" max="30" step="0.1" />
        </div>
        <div class="form-group">
          <label for="calcLoanTerm">Loan Term (months)</label>
          <input id="calcLoanTerm" type="number" [ngModel]="loanTerm()" (ngModelChange)="loanTerm.set($event)" min="1" max="84" step="1" />
        </div>
      </div>

      <div class="results">
        <div class="result-item">
          <span class="result-label">Financed Amount</span>
          <span class="result-value">{{ financedAmount() | currency }}</span>
        </div>
        <div class="result-item highlight">
          <span class="result-label">Monthly Payment</span>
          <span class="result-value">{{ monthlyPayment() | currency }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Total Interest</span>
          <span class="result-value">{{ totalInterest() | currency }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Total Cost</span>
          <span class="result-value">{{ totalCost() | currency }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calculator-container { max-width: 400px; padding: 1.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .calc-form { margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-size: 0.9rem; color: #555; }
    .form-group input { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
    .results { border-top: 2px solid #eee; padding-top: 1rem; }
    .result-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0; }
    .result-item.highlight { background: #f0f7ff; padding: 0.75rem 0.5rem; border-radius: 4px; font-weight: bold; font-size: 1.1rem; }
    .result-label { color: #555; }
    .result-value { font-weight: 600; }
  `]
})
export class PaymentCalculatorComponent {
  loanAmount = signal(25000);
  downPayment = signal(5000);
  interestRate = signal(5.5);
  loanTerm = signal(60);

  financedAmount = computed(() => Math.max(0, this.loanAmount() - this.downPayment()));

  monthlyPayment = computed(() => {
    const principal = this.financedAmount();
    const rate = this.interestRate() / 100 / 12;
    const term = this.loanTerm();
    if (principal <= 0 || term <= 0) return 0;
    if (rate === 0) return principal / term;
    return (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
  });

  totalCost = computed(() => this.monthlyPayment() * this.loanTerm());

  totalInterest = computed(() => Math.max(0, this.totalCost() - this.financedAmount()));
}
