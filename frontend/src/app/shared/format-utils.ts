export function formatCurrency(amount: number | null | undefined, locale = 'en-US', currency = 'USD'): string {
  if (amount == null) return '$0.00';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatDate(dateStr: string | null | undefined, locale = 'en-US'): string {
  if (!dateStr) return '';
  const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

export function formatDateTime(dateStr: string | null | undefined, locale = 'en-US'): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  }).format(date);
}

export function formatStatus(status: string | null | undefined): string {
  if (!status) return '';
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

export type StatusColor = 'green' | 'blue' | 'orange' | 'red' | 'gray';

export function getStatusColor(status: string | null | undefined): StatusColor {
  switch (status) {
    case 'APPROVED':
    case 'VERIFIED':
    case 'ACTIVE':
      return 'green';
    case 'SUBMITTED':
    case 'IN_REVIEW':
      return 'blue';
    case 'VERIFYING':
    case 'PENDING':
    case 'DRAFT':
      return 'orange';
    case 'REJECTED':
    case 'DENIED':
    case 'REVOKED':
      return 'red';
    default:
      return 'gray';
  }
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
