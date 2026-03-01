import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoanService } from '../../core/services/loan.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <div class="form-header">
        <a routerLink="/dashboard" class="back-link">&larr; Back</a>
        <h2>New Application</h2>
      </div>
      <hr />

      <!-- Stepper -->
      <div class="stepper">
        @for (s of steps; track s.num; let i = $index) {
          <div class="step" [class.active]="step() === s.num" [class.completed]="step() > s.num">
            <div class="step-circle">
              @if (step() > s.num) {
                <span class="check">&#10003;</span>
              } @else {
                {{ s.num }}
              }
            </div>
            <span class="step-label">{{ s.label }}</span>
          </div>
          @if (i < steps.length - 1) {
            <div class="step-line" [class.completed]="step() > s.num"></div>
          }
        }
      </div>

      @if (errorMessage()) {
        <div class="error">{{ errorMessage() }}</div>
      }

      <!-- Step 1: Personal Info -->
      @if (step() === 1) {
        <div class="step-card">
          <h3>Personal Information</h3>
          <form [formGroup]="personalForm">
            <div class="row">
              <div class="field">
                <label for="firstName">First Name</label>
                <input id="firstName" type="text" formControlName="firstName" />
              </div>
              <div class="field">
                <label for="lastName">Last Name</label>
                <input id="lastName" type="text" formControlName="lastName" />
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="dob">Date of Birth</label>
                <input id="dob" type="date" formControlName="dob" />
              </div>
              <div class="field">
                <label for="ssn">SSN</label>
                <input id="ssn" type="password" formControlName="ssn" placeholder="XXX-XX-XXXX" />
              </div>
            </div>
            <div class="row">
              <div class="field full">
                <label for="streetAddress">Street Address</label>
                <input id="streetAddress" type="text" formControlName="streetAddress" />
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="city">City</label>
                <input id="city" type="text" formControlName="city" />
              </div>
              <div class="field sm">
                <label for="addrState">State</label>
                <input id="addrState" type="text" formControlName="state" />
              </div>
              <div class="field sm">
                <label for="zip">ZIP</label>
                <input id="zip" type="text" formControlName="zip" />
              </div>
            </div>
            <div class="row">
              <div class="field sm">
                <label for="yearsAtAddress">Years at Address</label>
                <input id="yearsAtAddress" type="number" formControlName="yearsAtAddress" />
              </div>
              <div class="field sm">
                <label for="monthsAtAddress">Months</label>
                <input id="monthsAtAddress" type="number" formControlName="monthsAtAddress" />
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="phone">Phone</label>
                <input id="phone" type="tel" formControlName="phone" />
              </div>
              <div class="field">
                <label for="personalEmail">Email</label>
                <input id="personalEmail" type="email" formControlName="email" />
              </div>
            </div>
          </form>
        </div>
      }

      <!-- Step 2: Vehicle Info -->
      @if (step() === 2) {
        <div class="step-card">
          <h3>Vehicle Information</h3>
          <form [formGroup]="vehicleForm">
            <div class="condition-group">
              <span id="condLabel" class="field-label">Condition</span>
              <div class="condition-options" role="radiogroup" aria-labelledby="condLabel">
                @for (c of conditions; track c) {
                  <button type="button" class="cond-btn"
                    [class.selected]="vehicleForm.get('vehicleCondition')?.value === c"
                    (click)="vehicleForm.patchValue({vehicleCondition: c})">{{ c }}</button>
                }
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="vehicleMake">Make</label>
                <input id="vehicleMake" type="text" formControlName="vehicleMake" />
              </div>
              <div class="field">
                <label for="vehicleModel">Model</label>
                <input id="vehicleModel" type="text" formControlName="vehicleModel" />
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="vehicleTrim">Trim Level</label>
                <input id="vehicleTrim" type="text" formControlName="vehicleTrim" />
              </div>
              <div class="field">
                <label for="vehicleYear">Year</label>
                <input id="vehicleYear" type="number" formControlName="vehicleYear" />
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="vehicleMileage">Mileage</label>
                <input id="vehicleMileage" type="number" formControlName="vehicleMileage" />
              </div>
              <div class="field">
                <label for="vehicleVin">VIN</label>
                <input id="vehicleVin" type="text" formControlName="vehicleVin" />
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="vehicleEstimatedValue">Vehicle Value</label>
                <div class="input-prefix">
                  <span>$</span>
                  <input id="vehicleEstimatedValue" type="number" formControlName="vehicleEstimatedValue" />
                </div>
              </div>
            </div>
          </form>
        </div>
      }

      <!-- Step 3: Loan Details -->
      @if (step() === 3) {
        <div class="step-card">
          <h3>Loan Details</h3>
          <form [formGroup]="loanForm">
            <div class="row">
              <div class="field">
                <label for="loanAmount">Loan Amount</label>
                <div class="input-prefix">
                  <span>$</span>
                  <input id="loanAmount" type="number" formControlName="loanAmount" />
                </div>
              </div>
              <div class="field">
                <label for="downPayment">Down Payment</label>
                <div class="input-prefix">
                  <span>$</span>
                  <input id="downPayment" type="number" formControlName="downPayment" />
                </div>
              </div>
            </div>
          </form>
          <div class="loan-summary">
            <h4>Loan Summary</h4>
            <div>Vehicle Value: {{ vehicleForm.get('vehicleEstimatedValue')?.value | currency:'USD':'symbol':'1.0-0' }}</div>
            <div>Down Payment: {{ loanForm.get('downPayment')?.value | currency:'USD':'symbol':'1.0-0' }}</div>
            <div>Loan Amount: {{ loanForm.get('loanAmount')?.value | currency:'USD':'symbol':'1.0-0' }}</div>
            <div>Loan-to-Value: {{ ltv() }}%</div>
          </div>
        </div>
      }

      <!-- Step 4: Employment -->
      @if (step() === 4) {
        <div class="step-card">
          <h3>Employment &amp; Financial Info</h3>
          <form [formGroup]="employmentForm">
            <div class="row">
              <div class="field">
                <label for="employer">Employer</label>
                <input id="employer" type="text" formControlName="employer" />
              </div>
              <div class="field">
                <label for="jobTitle">Job Title</label>
                <input id="jobTitle" type="text" formControlName="jobTitle" />
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="employmentStatus">Employment Status</label>
                <select id="employmentStatus" formControlName="employmentStatus">
                  <option value="">Select</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div class="field sm">
                <label for="yearsAtJob">Years at Job</label>
                <input id="yearsAtJob" type="number" formControlName="yearsAtJob" />
              </div>
              <div class="field sm">
                <label for="monthsAtJob">Months</label>
                <input id="monthsAtJob" type="number" formControlName="monthsAtJob" />
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="annualIncome">Annual Income</label>
                <div class="input-prefix"><span>$</span><input id="annualIncome" type="number" formControlName="annualIncome" /></div>
              </div>
              <div class="field">
                <label for="monthlyExpenses">Monthly Expenses</label>
                <div class="input-prefix"><span>$</span><input id="monthlyExpenses" type="number" formControlName="monthlyExpenses" /></div>
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="otherIncome">Other Income</label>
                <div class="input-prefix"><span>$</span><input id="otherIncome" type="number" formControlName="otherIncome" /></div>
              </div>
              <div class="field">
                <label for="creditScore">Credit Score</label>
                <input id="creditScore" type="number" formControlName="creditScore" />
              </div>
            </div>
            <div class="dti" [class.good]="dti() < 36" [class.warn]="dti() >= 36 && dti() < 50" [class.bad]="dti() >= 50">
              &#9989; Debt-to-Income Ratio: {{ dti() }}% ({{ dti() < 36 ? 'Good' : dti() < 50 ? 'Fair' : 'High' }})
            </div>
          </form>
        </div>
      }

      <!-- Step 5: Review -->
      @if (step() === 5) {
        <div class="step-card">
          <h3>Select Terms &amp; Review</h3>
          <div class="term-options">
            @for (t of termOptions; track t.months) {
              <button type="button" class="term-card" [class.selected]="selectedTerm() === t.months"
                (click)="selectTerm(t.months)">
                <div class="term-months">{{ t.months }} months</div>
                <div class="term-payment">{{ monthlyForTerm(t.months) | currency:'USD':'symbol':'1.2-2' }}</div>
                <div class="term-rate">{{ t.rate }}% APR</div>
              </button>
            }
          </div>

          <div class="review-summary">
            <h4>Application Summary</h4>
            <div class="review-row">
              <span><strong>Personal:</strong> {{ personalForm.get('firstName')?.value }} {{ personalForm.get('lastName')?.value }}</span>
              <button class="edit-btn" (click)="goToStep(1)">Edit</button>
            </div>
            <div class="review-row">
              <span><strong>Vehicle:</strong> {{ vehicleForm.get('vehicleYear')?.value }} {{ vehicleForm.get('vehicleMake')?.value }} {{ vehicleForm.get('vehicleModel')?.value }}</span>
              <button class="edit-btn" (click)="goToStep(2)">Edit</button>
            </div>
            <div class="review-row">
              <span><strong>Loan:</strong> {{ loanForm.get('loanAmount')?.value | currency:'USD':'symbol':'1.0-0' }} &commat; {{ selectedRate() }}% for {{ selectedTerm() }} mo</span>
              <button class="edit-btn" (click)="goToStep(3)">Edit</button>
            </div>
            <div class="monthly-total">{{ monthlyForTerm(selectedTerm()) | currency:'USD':'symbol':'1.2-2' }}/month</div>

            <h4>Required Documents:</h4>
            <div class="doc-list">
              <span class="doc-tag">Driver&#39;s License</span>
              <span class="doc-tag">Proof of Income</span>
              <span class="doc-tag">Proof of Residence</span>
            </div>

            <label class="agreement" for="agreeCheck">
              <input id="agreeCheck" type="checkbox" [checked]="agreed()" (change)="agreed.set(!agreed())" />
              I agree to the Terms and Conditions
            </label>
          </div>
        </div>
      }

      <!-- Navigation -->
      <div class="nav-buttons">
        @if (step() > 1) {
          <button class="btn-outline" (click)="prev()">Back</button>
        }
        <button class="btn-outline save" (click)="saveDraft()" [disabled]="saving()">
          &#128190; Save Draft
        </button>
        @if (step() < 5) {
          <button class="btn-primary" (click)="next()">Next &rsaquo;</button>
        } @else {
          <button class="btn-primary submit" (click)="onSubmit()" [disabled]="!agreed() || saving()">
            {{ saving() ? 'Submitting...' : 'Submit' }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .form-container { max-width: 720px; margin: 1.5rem auto; padding: 0 1rem; }
    .form-header { display: flex; align-items: center; gap: 1rem; }
    .form-header h2 { margin: 0; font-size: 1.4rem; }
    .back-link { color: #2563eb; text-decoration: none; font-size: 0.9rem; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0; }
    .stepper { display: flex; align-items: center; justify-content: center; margin: 1.5rem 0 2rem; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
    .step-circle {
      width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 600; border: 2px solid #d1d5db; color: #6b7280; background: #fff;
    }
    .step.active .step-circle { border-color: #4f46e5; background: #4f46e5; color: #fff; }
    .step.completed .step-circle { border-color: #4f46e5; background: #4f46e5; color: #fff; }
    .check { font-size: 1rem; }
    .step-label { font-size: 0.75rem; color: #6b7280; }
    .step.active .step-label { color: #4f46e5; font-weight: 600; }
    .step-line { flex: 1; height: 2px; background: #d1d5db; margin: 0 0.25rem; margin-bottom: 1.2rem; }
    .step-line.completed { background: #4f46e5; }
    .step-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.5rem; background: #fff; }
    .step-card h3 { margin: 0 0 1.25rem; font-size: 1.15rem; }
    .row { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
    .field { flex: 1; min-width: 180px; margin-bottom: 0.5rem; }
    .field.full { flex: 100%; }
    .field.sm { flex: 0 0 100px; min-width: 80px; }
    .field label, .field-label { display: block; font-size: 0.8rem; color: #555; margin-bottom: 0.2rem; }
    .field input, .field select {
      width: 100%; padding: 0.55rem 0.6rem; border: 1px solid #d1d5db; border-radius: 6px;
      font-size: 0.9rem; box-sizing: border-box; background: #fff;
    }
    .field input:focus, .field select:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
    .input-prefix { display: flex; align-items: center; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; }
    .input-prefix span { padding: 0.55rem 0.5rem; background: #f9fafb; color: #888; font-size: 0.9rem; }
    .input-prefix input { border: none; flex: 1; padding: 0.55rem 0.5rem; font-size: 0.9rem; }
    .input-prefix input:focus { outline: none; }
    .condition-group { margin-bottom: 1rem; }
    .condition-options { display: flex; gap: 0.5rem; }
    .cond-btn {
      padding: 0.4rem 1rem; border: 1px solid #d1d5db; border-radius: 20px; background: #fff;
      cursor: pointer; font-size: 0.85rem; color: #374151;
    }
    .cond-btn.selected { background: #4f46e5; color: #fff; border-color: #4f46e5; }
    .loan-summary { margin-top: 1.25rem; padding: 1rem; background: #f9fafb; border-radius: 8px; font-size: 0.9rem; }
    .loan-summary h4 { margin: 0 0 0.5rem; }
    .loan-summary div { margin-bottom: 0.25rem; }
    .dti { margin-top: 0.75rem; font-size: 0.85rem; padding: 0.5rem; border-radius: 6px; }
    .dti.good { color: #166534; background: #dcfce7; }
    .dti.warn { color: #854d0e; background: #fef9c3; }
    .dti.bad { color: #991b1b; background: #fee2e2; }
    .term-options { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
    .term-card {
      flex: 1; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 10px; text-align: center;
      cursor: pointer; background: #fff; transition: border-color 0.15s;
    }
    .term-card:hover { border-color: #a5b4fc; }
    .term-card.selected { border-color: #4f46e5; background: #eef2ff; }
    .term-months { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem; }
    .term-payment { font-size: 1.1rem; font-weight: 700; }
    .term-rate { font-size: 0.8rem; color: #6b7280; }
    .review-summary { margin-top: 0.5rem; }
    .review-summary h4 { margin: 1rem 0 0.5rem; font-size: 1rem; }
    .review-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; }
    .edit-btn { background: none; border: none; color: #2563eb; cursor: pointer; font-size: 0.85rem; }
    .monthly-total { font-size: 1.2rem; font-weight: 700; margin: 0.75rem 0; color: #1e293b; }
    .doc-list { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .doc-tag { background: #f1f5f9; padding: 0.3rem 0.75rem; border-radius: 16px; font-size: 0.8rem; color: #475569; }
    .agreement { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; margin-top: 0.5rem; cursor: pointer; }
    .agreement input { width: 18px; height: 18px; }
    .nav-buttons { display: flex; justify-content: center; gap: 0.75rem; margin-top: 1.5rem; padding-bottom: 2rem; }
    .btn-outline {
      padding: 0.55rem 1.5rem; border: 1px solid #d1d5db; border-radius: 6px; background: #fff;
      cursor: pointer; font-size: 0.9rem; color: #374151;
    }
    .btn-outline:hover { background: #f9fafb; }
    .btn-outline.save { color: #d97706; border-color: #d97706; }
    .btn-primary {
      padding: 0.55rem 1.5rem; border: none; border-radius: 6px; background: #4f46e5;
      color: #fff; cursor: pointer; font-size: 0.9rem; font-weight: 500;
    }
    .btn-primary:hover { background: #4338ca; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #dc2626; background: #fee2e2; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; }
  `]
})
export class LoanFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loanService = inject(LoanService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  steps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Car Details' },
    { num: 3, label: 'Loan Details' },
    { num: 4, label: 'Employment' },
    { num: 5, label: 'Review' }
  ];

  conditions = ['New', 'Certified Used', 'Used'];

  termOptions = [
    { months: 36, rate: 6.5 },
    { months: 48, rate: 6.9 },
    { months: 60, rate: 7.2 }
  ];

  step = signal(1);
  errorMessage = signal('');
  saving = signal(false);
  agreed = signal(false);
  selectedTerm = signal(48);

  user = this.authService.currentUser;

  personalForm = this.fb.nonNullable.group({
    firstName: [this.user()?.firstName ?? '', Validators.required],
    lastName: [this.user()?.lastName ?? '', Validators.required],
    dob: [''],
    ssn: [''],
    streetAddress: [''],
    city: [''],
    state: [''],
    zip: [''],
    yearsAtAddress: [null as number | null],
    monthsAtAddress: [null as number | null],
    phone: [''],
    email: [this.user()?.email ?? '']
  });

  vehicleForm = this.fb.nonNullable.group({
    vehicleCondition: ['New'],
    vehicleMake: ['', Validators.required],
    vehicleModel: ['', Validators.required],
    vehicleYear: [2024, [Validators.required, Validators.min(1900)]],
    vehicleTrim: [''],
    vehicleMileage: [null as number | null],
    vehicleVin: [''],
    vehicleEstimatedValue: [null as number | null]
  });

  loanForm = this.fb.nonNullable.group({
    loanAmount: [0, [Validators.required, Validators.min(1000)]],
    downPayment: [0, [Validators.required, Validators.min(0)]]
  });

  employmentForm = this.fb.nonNullable.group({
    employer: [''],
    jobTitle: [''],
    employmentStatus: [''],
    yearsAtJob: [null as number | null],
    monthsAtJob: [null as number | null],
    annualIncome: [null as number | null],
    monthlyExpenses: [null as number | null],
    otherIncome: [null as number | null],
    creditScore: [null as number | null]
  });

  selectedRate = computed(() => {
    const term = this.termOptions.find(t => t.months === this.selectedTerm());
    return term?.rate ?? 6.9;
  });

  ltv = computed(() => {
    const val = this.vehicleForm.get('vehicleEstimatedValue')?.value || 0;
    const loan = this.loanForm.get('loanAmount')?.value || 0;
    return val > 0 ? Math.round((loan / val) * 100) : 0;
  });

  dti = computed(() => {
    const income = this.employmentForm.get('annualIncome')?.value || 0;
    const expenses = this.employmentForm.get('monthlyExpenses')?.value || 0;
    const monthlyIncome = income / 12;
    return monthlyIncome > 0 ? Math.round((expenses / monthlyIncome) * 100) : 0;
  });

  monthlyForTerm(months: number): number {
    const principal = (this.loanForm.get('loanAmount')?.value || 0) - (this.loanForm.get('downPayment')?.value || 0);
    const term = this.termOptions.find(t => t.months === months);
    const rate = (term?.rate ?? 6.9) / 100 / 12;
    if (principal <= 0 || rate <= 0) return 0;
    return (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  }

  selectTerm(months: number): void {
    this.selectedTerm.set(months);
  }

  goToStep(s: number): void {
    this.step.set(s);
  }

  next(): void {
    this.errorMessage.set('');
    if (this.step() < 5) this.step.update(s => s + 1);
  }

  prev(): void {
    this.errorMessage.set('');
    if (this.step() > 1) this.step.update(s => s - 1);
  }

  saveDraft(): void {
    this.saving.set(true);
    this.errorMessage.set('');
    const payload = this.buildPayload();
    this.loanService.createApplication(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.router.navigate(['/loans', res.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.message ?? 'Failed to save draft');
      }
    });
  }

  onSubmit(): void {
    this.saving.set(true);
    this.errorMessage.set('');
    const payload = this.buildPayload();
    this.loanService.createApplication(payload).subscribe({
      next: (res) => {
        this.loanService.submitApplication(res.id).subscribe({
          next: () => {
            this.saving.set(false);
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.saving.set(false);
            this.router.navigate(['/loans', res.id]);
          }
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.message ?? 'Failed to submit');
      }
    });
  }

  private buildPayload() {
    return {
      loanAmount: this.loanForm.get('loanAmount')?.value ?? 0,
      downPayment: this.loanForm.get('downPayment')?.value ?? 0,
      loanTerm: this.selectedTerm(),
      dob: this.personalForm.get('dob')?.value || undefined,
      vehicleMake: this.vehicleForm.get('vehicleMake')?.value ?? '',
      vehicleModel: this.vehicleForm.get('vehicleModel')?.value ?? '',
      vehicleYear: this.vehicleForm.get('vehicleYear')?.value ?? 2024,
      vehicleTrim: this.vehicleForm.get('vehicleTrim')?.value || undefined,
      vehicleVin: this.vehicleForm.get('vehicleVin')?.value || undefined,
      vehicleMileage: this.vehicleForm.get('vehicleMileage')?.value ?? undefined,
      vehicleCondition: this.vehicleForm.get('vehicleCondition')?.value || undefined,
      vehicleEstimatedValue: this.vehicleForm.get('vehicleEstimatedValue')?.value ?? undefined
    };
  }
}
