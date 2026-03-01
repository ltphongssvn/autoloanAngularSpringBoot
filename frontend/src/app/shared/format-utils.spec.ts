import {
  formatCurrency, formatDate, formatDateTime, formatStatus,
  getStatusColor, formatPhone, formatFileSize
} from './format-utils';

describe('format-utils', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });
    it('should handle null/undefined', () => {
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
    });
    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatDate', () => {
    it('should format date string', () => {
      const result = formatDate('2026-03-15');
      expect(result).toContain('Mar');
      expect(result).toContain('15');
      expect(result).toContain('2026');
    });
    it('should handle null/empty', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('')).toBe('');
    });
    it('should handle invalid date', () => {
      expect(formatDate('not-a-date')).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime string', () => {
      const result = formatDateTime('2026-03-15T14:30:00');
      expect(result).toContain('Mar');
      expect(result).toContain('2026');
    });
    it('should handle null', () => {
      expect(formatDateTime(null)).toBe('');
    });
  });

  describe('formatStatus', () => {
    it('should format status with underscores', () => {
      expect(formatStatus('IN_REVIEW')).toBe('In Review');
      expect(formatStatus('BANK_STATEMENT')).toBe('Bank Statement');
    });
    it('should handle single word', () => {
      expect(formatStatus('APPROVED')).toBe('Approved');
    });
    it('should handle null/empty', () => {
      expect(formatStatus(null)).toBe('');
      expect(formatStatus('')).toBe('');
    });
  });

  describe('getStatusColor', () => {
    it('should return green for approved statuses', () => {
      expect(getStatusColor('APPROVED')).toBe('green');
      expect(getStatusColor('VERIFIED')).toBe('green');
    });
    it('should return blue for review statuses', () => {
      expect(getStatusColor('SUBMITTED')).toBe('blue');
      expect(getStatusColor('IN_REVIEW')).toBe('blue');
    });
    it('should return orange for pending statuses', () => {
      expect(getStatusColor('DRAFT')).toBe('orange');
      expect(getStatusColor('VERIFYING')).toBe('orange');
    });
    it('should return red for rejected statuses', () => {
      expect(getStatusColor('REJECTED')).toBe('red');
      expect(getStatusColor('REVOKED')).toBe('red');
    });
    it('should return gray for unknown', () => {
      expect(getStatusColor('UNKNOWN')).toBe('gray');
      expect(getStatusColor(null)).toBe('gray');
    });
  });

  describe('formatPhone', () => {
    it('should format 10-digit phone', () => {
      expect(formatPhone('5551234567')).toBe('(555) 123-4567');
    });
    it('should format 11-digit phone with country code', () => {
      expect(formatPhone('15551234567')).toBe('+1 (555) 123-4567');
    });
    it('should return original for other formats', () => {
      expect(formatPhone('123')).toBe('123');
    });
    it('should handle null/empty', () => {
      expect(formatPhone(null)).toBe('');
      expect(formatPhone('')).toBe('');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });
    it('should format kilobytes', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
    it('should format megabytes', () => {
      expect(formatFileSize(2097152)).toBe('2.0 MB');
    });
    it('should handle null/negative', () => {
      expect(formatFileSize(null)).toBe('0 B');
      expect(formatFileSize(-1)).toBe('0 B');
    });
  });
});
