'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { writeAudit } from '@/lib/audit';
import type { ClaimStatus } from '@prisma/client';

export async function updateWarrantyClaimAction(formData: FormData) {
  const admin = await requireAdmin();
  const claimId = String(formData.get('claimId') || '');
  const status = String(formData.get('status') || '');
  const adminResponse = String(formData.get('adminResponse') || '').trim();
  if (!['OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED'].includes(status)) throw new Error('Status klaim tidak valid.');

  const claim = await db.warrantyClaim.findUnique({ where: { id: claimId }, include: { order: true } });
  if (!claim) throw new Error('Klaim tidak ditemukan.');
  await db.$transaction(async (tx) => {
    await tx.warrantyClaim.update({ where: { id: claim.id }, data: { status: status as ClaimStatus, adminResponse: adminResponse || null } });
    await tx.notification.create({
      data: { userId: claim.userId, title: `Klaim ${claim.code}: ${status}`, message: adminResponse || 'Admin memperbarui status klaim garansi.' },
    });
    await writeAudit(tx, admin.id, 'UPDATE_CLAIM', 'WarrantyClaim', claim.id, status);
  });
  revalidatePath('/admin/support');
  revalidatePath('/support');
  revalidatePath(`/orders/${claim.order.code}`);
}

export async function moderateReviewAction(formData: FormData) {
  const admin = await requireAdmin();
  const reviewId = String(formData.get('reviewId') || '');
  const approved = formData.get('approved') === 'true';
  await db.$transaction(async (tx) => {
    await tx.review.update({ where: { id: reviewId }, data: { approved } });
    await writeAudit(tx, admin.id, approved ? 'APPROVE_REVIEW' : 'HIDE_REVIEW', 'Review', reviewId);
  });
  revalidatePath('/admin/support');
  revalidatePath('/');
}
