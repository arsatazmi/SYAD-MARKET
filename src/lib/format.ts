import { randomBytes } from 'crypto';

export const rupiah = (value: number) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;

export const formatDate = (value: Date | string, withTime = true) => new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  ...(withTime ? { timeStyle: 'short' } : {}),
  timeZone: 'Asia/Jakarta',
}).format(new Date(value));

export const normalizeWhatsapp = (value: string) => {
  let number = value.replace(/\D/g, '');
  if (number.startsWith('0')) number = `62${number.slice(1)}`;
  if (number.startsWith('8')) number = `62${number}`;
  return number;
};

export const displayWhatsapp = (value: string) => {
  const normalized = normalizeWhatsapp(value);
  return normalized.startsWith('62') ? `0${normalized.slice(2)}` : normalized;
};

export const makeCode = (prefix: string) => `${prefix}-${randomBytes(4).toString('hex').toUpperCase()}`;

export const slugify = (value: string) => value
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 70);

export const orderStatusLabels: Record<string, string> = {
  PENDING_QUOTE: 'Menunggu Harga',
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PENDING_REVIEW: 'Verifikasi Pembayaran',
  PROCESSING: 'Sedang Diproses',
  PARTIAL: 'Sebagian Selesai',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  REJECTED: 'Ditolak',
  REFUNDED: 'Dikembalikan',
};

export const paymentStatusLabels: Record<string, string> = {
  UNPAID: 'Belum Dibayar',
  PENDING_REVIEW: 'Menunggu Verifikasi',
  PAID: 'Sudah Dibayar',
  REFUNDED: 'Dikembalikan',
};

export const claimStatusLabels: Record<string, string> = {
  OPEN: 'Diajukan',
  IN_REVIEW: 'Ditinjau',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  RESOLVED: 'Selesai',
};

export function whatsappUrl(phone: string, message: string) {
  return `https://wa.me/${normalizeWhatsapp(phone)}?text=${encodeURIComponent(message)}`;
}

export function safeNextPath(value: FormDataEntryValue | null, fallback = '/dashboard') {
  const path = typeof value === 'string' ? value : '';
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\') || /[\r\n]/.test(path)) return fallback;
  try {
    const url = new URL(path, 'https://syad.local');
    return url.origin === 'https://syad.local' ? path : fallback;
  } catch {
    return fallback;
  }
}
