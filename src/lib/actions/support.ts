'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { reviewSchema, warrantySchema } from '@/lib/validation';
import { makeCode } from '@/lib/format';
import type { ActionState } from '@/lib/types';

export async function createReviewAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse({
    orderId: formData.get('orderId'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Ulasan tidak valid.' };

  const order = await db.order.findFirst({ where: { id: parsed.data.orderId, userId: user.id } });
  if (!order || !['COMPLETED', 'PARTIAL'].includes(order.status)) {
    return { error: 'Ulasan hanya dapat dibuat untuk order yang sudah selesai.' };
  }

  await db.review.upsert({
    where: { orderId: order.id },
    update: { rating: parsed.data.rating, comment: parsed.data.comment, approved: false },
    create: {
      userId: user.id,
      orderId: order.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });
  revalidatePath(`/orders/${order.code}`);
  revalidatePath('/admin/support');
  return { success: 'Ulasan tersimpan dan menunggu moderasi admin.' };
}

export async function createWarrantyClaimAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = warrantySchema.safeParse({
    orderId: formData.get('orderId'),
    description: formData.get('description'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Data klaim tidak valid.' };

  const order = await db.order.findFirst({ where: { id: parsed.data.orderId, userId: user.id } });
  if (!order || !['COMPLETED', 'PARTIAL', 'PROCESSING'].includes(order.status)) {
    return { error: 'Klaim hanya dapat dibuat untuk order yang sedang diproses atau sudah selesai.' };
  }

  const existing = await db.warrantyClaim.findFirst({
    where: { orderId: order.id, status: { in: ['OPEN', 'IN_REVIEW', 'APPROVED'] } },
  });
  if (existing) return { error: `Masih ada klaim aktif: ${existing.code}.` };

  const claim = await db.warrantyClaim.create({
    data: {
      code: makeCode('GRS'),
      userId: user.id,
      orderId: order.id,
      description: parsed.data.description,
    },
  });
  await db.notification.create({
    data: { userId: user.id, title: `Klaim ${claim.code} diterima`, message: 'Admin akan meninjau klaim garansi secara manual.' },
  });
  revalidatePath(`/orders/${order.code}`);
  revalidatePath('/support');
  revalidatePath('/admin/support');
  return { success: `Klaim ${claim.code} berhasil diajukan.` };
}

export async function markNotificationsReadAction() {
  const user = await requireUser();
  await db.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}
