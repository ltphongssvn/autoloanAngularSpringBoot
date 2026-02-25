import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoanService } from '../../core/services/loan.service';

@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <h2>New Loan Application</h2>
      <a routerLink="/dashboard">&larr; Back to Dashboard</a>
      @if (errorMessage) {
        <div class="error">{{ errorMessage }}</div>
      }
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <fieldset>
          <legend>Loan Details</legend>
          <div class="row">
            <div class="field">
              <label for="loanAmount">Loan Amount ($)</label>
              <input id="loanAmount" type="number" formControlName="loanAmount" />
            </div>
            <div class="field">
              <label for="downPayment">Down Payment ($)</label>
              <input id="downPayment" type="number" formControlName="downPayment" />
            </div>
            <div class="field">
              <label for="loanTerm">Term (months)</label>
              <input id="loanTerm" type="number" formControlName="loanTerm" />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Vehicle Information</legend>
          <div class="row">
            <div class="field">
              <label for="vehicleMake">Make</label>
              <input id="vehicleMake" type="text" formControlName="vehicleMake" />
            </div>
            <div class="field">
              <label for="vehicleModel">Model</label>
              <input id="vehicleModel" type="text" formControlName="vehicleModel" />
            </div>
            <div class="field">
              <label for="vehicleYear">Year</label>
              <input id="vehicleYear" type="number" formControlName="vehicleYear" />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label for="vehicleVin">VIN (optional)</label>
              <input id="vehicleVin" type="text" formControlName="vehicleVin" />
            </div>
            <div class="field">
              <label for="vehicleMileage">Mileage (optional)</label>
              <input id="vehicleMileage" type="number" formControlName="vehicleMileage" />
            </div>
            <div class="field">
              <label for="vehicleCondition">Condition (optional)</label>
              <select id="vehicleCondition" formControlName="vehicleCondition">
                <option value="">Select</option>
                <option value="New">New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>
        </fieldset>
        <button type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Submitting...' : 'Create Application' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 800px; margin: 2rem auto; padding: 1rem; }
    fieldset { border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; }
    .row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .field { flex: 1; min-width: 200px; margin-bottom: 1rem; }
    .field label { display: block; margin-bottom: 0.25rem; }
    .field input, .field select { width: 100%; padding: 0.5rem; box-sizing: border-box; }
    .error { color: red; margin: 1rem 0; }
    button { width: 100%; padding: 0.75rem; cursor: pointer; }
  `]
})
export class LoanFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loanService = inject(LoanService);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    loanAmount: [0, [Validators.required, Validators.min(1000)]],
    downPayment: [0, [Validators.required, Validators.min(0)]],
    loanTerm: [0, [Validators.required, Validators.min(6)]],
    vehicleMake: ['', Validators.required],
    vehicleModel: ['', Validators.required],
    vehicleYear: [0, [Validators.required, Validators.min(1900)]],
    vehicleVin: [''],
    vehicleMileage: [null as number | null],
    vehicleCondition: ['']
  });

  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.loanService.createApplication(this.form.getRawValue()).subscribe({
      next: (res) => this.router.navigate(['/loans', res.id]),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message ?? 'Failed to create application';
      }
    });
  }
}
