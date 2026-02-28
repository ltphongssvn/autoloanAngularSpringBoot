// frontend/src/app/shared/request-documents-modal.ts
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
            <h3>Request Additional Documents</h3>
            <button class="close-btn" (click)="close()" aria-label="Close">&times;</button>
          </div>

          <div class="modal-body">
            <p class="subtitle">Select documents to request:</p>

            <div class="doc-types">
              @for (dt of availableDocTypes; track dt.value) {
                <label class="checkbox-label">
                  <input type="checkbox" [checked]="selectedTypes.includes(dt.value)" (change)="toggleType(dt.value)" />
                  {{ dt.label }}
                </label>
                @if (dt.value === 'OTHER' && selectedTypes.includes('OTHER')) {
                  <input type="text" class="other-input" [(ngModel)]="otherText" placeholder="Specify document type..." />
                }
              }
            </div>

            <div class="form-group">
              <label for="requestMessage">Notes to applicant:</label>
              <textarea id="requestMessage" [(ngModel)]="message" rows="3" class="textarea" placeholder="Please provide the following documents..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outlined" (click)="close()">Cancel</button>
            <button class="btn btn-primary" (click)="submit()" [disabled]="selectedTypes.length === 0">Send Request</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.45); display: flex; align-items: center;
      justify-content: center; z-index: 2000;
    }
    .modal-content {
      background: #fff; border-radius: 10px; width: 480px; max-width: 90vw;
      max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb;
    }
    .modal-header h3 { margin: 0; font-size: 1.15rem; color: #1e293b; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280; }
    .close-btn:hover { color: #333; }

    .modal-body { padding: 1.25rem 1.5rem; }
    .subtitle { font-size: 0.9rem; font-weight: 500; color: #374151; margin: 0 0 0.75rem; }

    .doc-types { margin-bottom: 1rem; }
    .checkbox-label {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0;
      cursor: pointer; font-size: 0.9rem;
    }
    .checkbox-label input { width: 16px; height: 16px; cursor: pointer; }
    .other-input {
      width: calc(100% - 1.5rem); margin-left: 1.5rem; padding: 0.4rem 0.6rem;
      border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.85rem; margin-bottom: 0.25rem;
    }
    .other-input:focus { outline: none; border-color: #1976d2; }

    .form-group label { display: block; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.35rem; color: #374151; }
    .textarea {
      width: 100%; padding: 0.55rem 0.6rem; border: 1px solid #d1d5db;
      border-radius: 6px; font-size: 0.9rem; resize: vertical; box-sizing: border-box;
    }
    .textarea:focus { outline: none; border-color: #1976d2; box-shadow: 0 0 0 2px rgba(25,118,210,0.1); }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 0.5rem;
      padding: 0.75rem 1.5rem; border-top: 1px solid #e5e7eb;
    }
    .btn {
      padding: 0.5rem 1.1rem; border-radius: 6px; font-size: 0.9rem;
      cursor: pointer; font-weight: 500; border: none;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: #1976d2; color: white; }
    .btn-primary:hover { background: #1565c0; }
    .btn-outlined { background: white; color: #374151; border: 1px solid #d1d5db; }
    .btn-outlined:hover { background: #f3f4f6; }
  `]
})
export class RequestDocumentsModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<DocumentRequest>();

  availableDocTypes = [
    { value: 'ID', label: 'Government ID' },
    { value: 'INCOME', label: 'Proof of Income' },
    { value: 'BANK_STATEMENT', label: 'Bank Statements (3 months)' },
    { value: 'INSURANCE', label: 'Proof of Insurance' },
    { value: 'VEHICLE_TITLE', label: 'Vehicle Title' },
    { value: 'OTHER', label: 'Other' }
  ];

  selectedTypes: string[] = [];
  message = '';
  otherText = '';

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
    this.otherText = '';
  }
}
