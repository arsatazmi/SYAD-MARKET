import { z } from 'zod';

const whatsappSchema = z.string().trim().min(9, 'Nomor WhatsApp tidak valid.').max(20, 'Nomor WhatsApp terlalu panjang.')
  .regex(/^[0-9+()\s.-]+$/, 'Nomor WhatsApp hanya boleh berisi angka dan karakter + ( ) - .')
  .refine((value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 9 && digits.length <= 15;
  }, 'Nomor WhatsApp harus berisi 9–15 digit.');

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter.').max(70),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{4,20}$/, 'Username 4–20 karakter: huruf kecil, angka, atau underscore.'),
  email: z.string().trim().toLowerCase().email('Format email tidak valid.').max(120).or(z.literal('')).optional(),
  whatsapp: whatsappSchema,
  password: z.string().min(8, 'Password minimal 8 karakter.').max(100),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Masukkan username atau email.'),
  password: z.string().min(1, 'Masukkan password.'),
});

export const profileSchema = z.object({
  name: z.string().trim().min(3).max(70),
  email: z.string().trim().toLowerCase().email().max(120).or(z.literal('')),
  whatsapp: whatsappSchema,
});

export const orderSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().trim().min(3, 'Nama pembeli minimal 3 karakter.').max(70),
  whatsapp: whatsappSchema,
  packageDetails: z.string().trim().max(1000).optional(),
  target: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
  quantity: z.coerce.number().int().min(1).max(100000000),
});

export const walletRequestSchema = z.object({
  type: z.enum(['TOPUP', 'REFUND']),
  amount: z.coerce.number().int().min(10000, 'Minimal Rp 10.000.').max(10000000, 'Maksimal Rp 10.000.000 per permintaan.'),
  whatsapp: whatsappSchema,
  note: z.string().trim().max(700).optional(),
});

export const reviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5, 'Ulasan minimal 5 karakter.').max(700),
});

export const warrantySchema = z.object({
  orderId: z.string().min(1),
  description: z.string().trim().min(10, 'Jelaskan kendala minimal 10 karakter.').max(1500),
});
