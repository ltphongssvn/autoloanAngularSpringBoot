import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { UserProfile } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="profile-container">
      <a routerLink="/dashboard">&larr; Back to Dashboard</a>
      <h2>My Profile</h2>
      @if (successMessage) {
        <div class="success">{{ successMessage }}</div>
      }
      @if (errorMessage) {
        <div class="error">{{ errorMessage }}</div>
      }
      @if (profile()) {
        <div class="info">
          <div><strong>Email:</strong> {{ profile()!.email }}</div>
          <div><strong>Role:</strong> {{ profile()!.role }}</div>
          <div><strong>Sign-in Count:</strong> {{ profile()!.signInCount }}</div>
        </div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="firstName">First Name</label>
            <input id="firstName" type="text" formControlName="firstName" />
          </div>
          <div class="field">
            <label for="lastName">Last Name</label>
            <input id="lastName" type="text" formControlName="lastName" />
          </div>
          <div class="field">
            <label for="phone">Phone</label>
            <input id="phone" type="text" formControlName="phone" />
          </div>
          <button type="submit" [disabled]="form.invalid || saving">
            {{ saving ? 'Saving...' : 'Update Profile' }}
          </button>
        </form>
      } @else {
        <p>Loading...</p>
      }
    </div>
  `,
  styles: [`
    .profile-container { max-width: 500px; margin: 2rem auto; padding: 1rem; }
    .info { margin: 1rem 0; }
    .info div { margin-bottom: 0.5rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; margin-bottom: 0.25rem; }
    .field input { width: 100%; padding: 0.5rem; box-sizing: border-box; }
    .error { color: red; margin: 1rem 0; }
    .success { color: green; margin: 1rem 0; }
    button { width: 100%; padding: 0.75rem; cursor: pointer; }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  profile = signal<UserProfile | null>(null);
  saving = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', Validators.required]
  });

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.form.patchValue({ firstName: p.firstName, lastName: p.lastName, phone: p.phone });
      },
      error: () => this.errorMessage = 'Failed to load profile'
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.updateProfile(this.form.getRawValue()).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.saving = false;
        this.successMessage = 'Profile updated successfully';
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.message ?? 'Failed to update profile';
      }
    });
  }
}
