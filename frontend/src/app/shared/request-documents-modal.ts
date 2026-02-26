import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DocumentRequest {
  docTypes: string[];
  message: string;
}

@Component({
  selector: 'app-request-documents-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" role="dialog" tabindex="0" (click)="close()" (keydown.escape)="close()">
        <div class="modal-content" role="document" tabindex="-1" (click)="$event.stopPropagation()" (keydown.escape)="close()">
          <div class="modal-header">
            <h3>Request Documents</h3>
            <button class="close-btn" (click)="close()" aria-label="Close">&times;</button>
          </div>

          <div class="modal-body">
            <p>Select the documents to request from the applicant:</p>

            <div class="doc-types">
              @for (dt of availableDocTypes; track dt.value) {
                <label class="checkbox-label">
                  <input type="checkbox" [checked]="selectedTypes.includes(dt.value)" (change)="toggleType(dt.value)" />
                  {{ dt.label }}
                </label>
              }
            </div>

            <div class="form-group">
              <label for="requestMessage">Message to Applicant</label>
              <textarea id="requestMessage" [(ngModel)]="message" rows="3" placeholder="Please provide the following documents..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="close()">Cancel</button>
            <button class="submit-btn" (click)="submit()" [disabled]="selectedTypes.length === 0">Send Request</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal-content { background: #fff; border-radius: 8px; width: 500px; max-width: 90vw; max-height: 80vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #eee; }
    .modal-header h3 { margin: 0; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666; }
    .modal-body { padding: 1.5rem; }
    .doc-types { margin: 1rem 0; }
    .checkbox-label { display: block; padding: 0.4rem 0; cursor: pointer; }
    .checkbox-label input { margin-right: 0.5rem; }
    .form-group { margin-top: 1rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
    .form-group textarea { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem 1.5rem; border-top: 1px solid #eee; }
    .submit-btn { background: #007bff; color: #fff; border: none; border-radius: 4px; padding: 0.5rem 1rem; cursor: pointer; }
    .submit-btn:disabled { opacity: 0.5; }
    button { padding: 0.5rem 1rem; cursor: pointer; }
  `]
})
export class RequestDocumentsModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<DocumentRequest>();

  availableDocTypes = [
    { value: 'ID', label: 'Government ID' },
    { value: 'INCOME', label: 'Proof of Income' },
    { value: 'BANK_STATEMENT', label: 'Bank Statement' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'VEHICLE_TITLE', label: 'Vehicle Title' },
    { value: 'OTHER', label: 'Other' }
  ];

  selectedTypes: string[] = [];
  message = '';

  toggleType(type: string): void {
    const idx = this.selectedTypes.indexOf(type);
    if (idx >= 0) {
      this.selectedTypes.splice(idx, 1);
    } else {
      this.selectedTypes.push(type);
    }
  }

  submit(): void {
    if (this.selectedTypes.length === 0) return;
    this.submitted.emit({ docTypes: [...this.selectedTypes], message: this.message });
    this.reset();
  }

  close(): void {
    this.reset();
    this.closed.emit();
  }

  private reset(): void {
    this.selectedTypes = [];
    this.message = '';
  }
}
