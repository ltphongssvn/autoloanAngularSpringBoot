import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../core/services/document.service';
import { DocumentResponse } from '../../core/models/document.model';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="documents-container">
      <h3>Documents</h3>

      <div class="upload-section">
        <div class="upload-form">
          <label for="docType">Document Type:</label>
          <select id="docType" [(ngModel)]="selectedDocType">
            <option value="">Select type...</option>
            <option value="ID">Government ID</option>
            <option value="INCOME">Proof of Income</option>
            <option value="BANK_STATEMENT">Bank Statement</option>
            <option value="INSURANCE">Insurance</option>
            <option value="VEHICLE_TITLE">Vehicle Title</option>
            <option value="OTHER">Other</option>
          </select>
          <label for="fileInput" class="sr-only">Choose file</label>
          <input id="fileInput" type="file" (change)="onFileSelected($event)" #fileInput />
          <button (click)="upload(); fileInput.value = ''" [disabled]="!selectedFile || !selectedDocType || uploading">
            {{ uploading ? 'Uploading...' : 'Upload' }}
          </button>
        </div>
        @if (uploadError) {
          <div class="error">{{ uploadError }}</div>
        }
        @if (uploadSuccess) {
          <div class="success">{{ uploadSuccess }}</div>
        }
      </div>

      <div class="documents-list">
        @if (documents().length === 0) {
          <p>No documents uploaded yet.</p>
        }

        @for (doc of documents(); track doc.id) {
          <div class="doc-card">
            <div class="doc-header">
              <strong>{{ doc.fileName }}</strong>
              <span class="doc-status" [attr.data-status]="doc.status">{{ doc.status }}</span>
            </div>
            <div class="doc-meta">
              <span>Type: {{ doc.docType }}</span>
              @if (doc.fileSize) {
                <span>Size: {{ formatSize(doc.fileSize) }}</span>
              }
              <span>Uploaded: {{ doc.createdAt }}</span>
            </div>
            <div class="doc-actions">
              <button (click)="download(doc)">Download</button>
              @if (showReviewActions) {
                @if (doc.status === 'UPLOADED' || doc.status === 'PENDING') {
                  <button class="verify" (click)="updateStatus(doc.id, 'VERIFIED')">Verify</button>
                  <button class="reject-btn" (click)="showReject(doc.id)">Reject</button>
                }
              }
              @if (doc.status !== 'VERIFIED') {
                <button class="delete" (click)="remove(doc.id)">Delete</button>
              }
            </div>
            @if (rejectingId === doc.id) {
              <div class="reject-form">
                <label for="rejectComment-{{doc.id}}">Rejection reason:</label>
                <input id="rejectComment-{{doc.id}}" type="text" [(ngModel)]="rejectComment" placeholder="Reason..." />
                <button class="reject-btn" (click)="updateStatus(doc.id, 'REJECTED')">Confirm Reject</button>
                <button (click)="rejectingId = 0">Cancel</button>
              </div>
            }
          </div>
        }
      </div>

      @if (actionError) {
        <div class="error">{{ actionError }}</div>
      }
    </div>
  `,
  styles: [`
    .documents-container { margin-top: 1.5rem; }
    .upload-section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 4px; }
    .upload-form { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .upload-form select, .upload-form input[type="file"] { padding: 0.4rem; }
    .doc-card { border: 1px solid #eee; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 4px; }
    .doc-header { display: flex; justify-content: space-between; align-items: center; }
    .doc-status { font-size: 0.85rem; padding: 0.15rem 0.5rem; border-radius: 3px; background: #e9ecef; }
    .doc-meta { display: flex; gap: 1rem; font-size: 0.8rem; color: #666; margin: 0.5rem 0; flex-wrap: wrap; }
    .doc-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .verify { background: #28a745; color: #fff; border: none; border-radius: 4px; }
    .reject-btn { background: #dc3545; color: #fff; border: none; border-radius: 4px; }
    .delete { background: #6c757d; color: #fff; border: none; border-radius: 4px; }
    .reject-form { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .reject-form input { padding: 0.4rem; flex: 1; min-width: 150px; }
    .error { color: red; margin-top: 0.5rem; }
    .success { color: green; margin-top: 0.5rem; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
    button { padding: 0.4rem 0.8rem; cursor: pointer; }
    button:disabled { opacity: 0.5; }
  `]
})
export class DocumentUploadComponent implements OnInit {
  private readonly documentService = inject(DocumentService);

  @Input() applicationId = 0;
  @Input() showReviewActions = false;

  documents = signal<DocumentResponse[]>([]);
  selectedFile: File | null = null;
  selectedDocType = '';
  uploading = false;
  uploadError = '';
  uploadSuccess = '';
  actionError = '';
  rejectingId = 0;
  rejectComment = '';

  ngOnInit(): void {
    if (this.applicationId) {
      this.loadDocuments();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  upload(): void {
    if (!this.selectedFile || !this.selectedDocType) return;
    this.uploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.documentService.upload(this.applicationId, this.selectedFile, this.selectedDocType).subscribe({
      next: (doc) => {
        this.documents.update(docs => [doc, ...docs]);
        this.selectedFile = null;
        this.selectedDocType = '';
        this.uploadSuccess = `${doc.fileName} uploaded successfully`;
        this.uploading = false;
      },
      error: (err) => {
        this.uploadError = err.error?.message ?? 'Failed to upload document';
        this.uploading = false;
      }
    });
  }

  download(doc: DocumentResponse): void {
    this.documentService.download(doc.id).subscribe({
      next: (res) => {
        window.open(res.url, '_blank');
      },
      error: () => this.actionError = 'Failed to download document'
    });
  }

  updateStatus(id: number, status: string): void {
    this.actionError = '';
    const request = { status, ...(status === 'REJECTED' && this.rejectComment ? { comment: this.rejectComment } : {}) };
    this.documentService.updateStatus(id, request).subscribe({
      next: (updated) => {
        this.documents.update(docs => docs.map(d => d.id === id ? updated : d));
        this.rejectingId = 0;
        this.rejectComment = '';
      },
      error: (err) => this.actionError = err.error?.message ?? 'Failed to update status'
    });
  }

  remove(id: number): void {
    this.actionError = '';
    this.documentService.delete(id).subscribe({
      next: () => this.documents.update(docs => docs.filter(d => d.id !== id)),
      error: (err) => this.actionError = err.error?.message ?? 'Failed to delete document'
    });
  }

  showReject(id: number): void {
    this.rejectingId = id;
    this.rejectComment = '';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private loadDocuments(): void {
    this.documentService.list(this.applicationId).subscribe({
      next: (docs) => this.documents.set(docs),
      error: () => this.documents.set([])
    });
  }
}
