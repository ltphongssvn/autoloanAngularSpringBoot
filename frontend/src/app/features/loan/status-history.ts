import { Component, Input, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../core/services/loan.service';
import { StatusHistoryResponse } from '../../core/services/loan-officer.service';

@Component({
  selector: 'app-status-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="history-container">
      <h3>Status History</h3>

      @if (loading()) {
        <p>Loading history...</p>
      }

      @if (!loading() && entries().length === 0) {
        <p>No status changes recorded.</p>
      }

      <div class="timeline">
        @for (entry of entries(); track entry.id) {
          <div class="timeline-entry">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="transition">
                <span class="from">{{ entry.fromStatus }}</span>
                <span class="arrow">→</span>
                <span class="to">{{ entry.toStatus }}</span>
              </div>
              @if (entry.comment) {
                <div class="comment">{{ entry.comment }}</div>
              }
              <div class="meta">{{ entry.createdAt }}</div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .history-container { margin-top: 1.5rem; }
    .timeline { position: relative; padding-left: 1.5rem; }
    .timeline::before { content: ''; position: absolute; left: 6px; top: 0; bottom: 0; width: 2px; background: #dee2e6; }
    .timeline-entry { position: relative; margin-bottom: 1rem; }
    .timeline-dot { position: absolute; left: -1.5rem; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: #007bff; border: 2px solid #fff; box-shadow: 0 0 0 2px #dee2e6; }
    .timeline-content { padding: 0.5rem 0.75rem; border: 1px solid #eee; border-radius: 4px; background: #fafafa; }
    .transition { display: flex; align-items: center; gap: 0.5rem; font-weight: bold; }
    .from { color: #666; }
    .arrow { color: #999; }
    .to { color: #333; }
    .comment { margin-top: 0.25rem; color: #555; font-style: italic; font-size: 0.9rem; }
    .meta { font-size: 0.8rem; color: #999; margin-top: 0.25rem; }
  `]
})
export class StatusHistoryComponent implements OnInit {
  private readonly loanService = inject(LoanService);

  @Input() applicationId = 0;
  @Input() set history(value: StatusHistoryResponse[]) {
    if (value) {
      this.entries.set(value);
      this.loading.set(false);
      this.externalData = true;
    }
  }

  entries = signal<StatusHistoryResponse[]>([]);
  loading = signal(true);
  private externalData = false;

  ngOnInit(): void {
    if (!this.externalData && this.applicationId) {
      this.loanService.getHistory(this.applicationId).subscribe({
        next: (h) => {
          this.entries.set(h);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }
}
