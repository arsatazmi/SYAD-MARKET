'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { makeCode } from '@/lib/format';
import { writeAudit } from '@/lib/audit';

function refreshWallet() {
  revalidatePath('/admin');
  revalidatePath('/admin/wallet');
  revalidatePath('/admin/users');
  revalidatePath('/wallet');
  revalidatePath('/dashboard');
}

export async function reviewWalletRequestAction(formData: FormData) {
  const admin = await requireAdmin();
  const requestId = String(formData.get('requestId') || '');
  const decision = String(formData.get('decision') || '');
  const adminNote = String(formData.get('adminNote') || '').trim();
  if (!['APPROVE', 'REJECT'].includes(decision)) throw new Error('Keputusan tidak valid.');

  await db.$transaction(async (tx) => {
    const claimed = await tx.walletRequest.updateMany({
      where: { id: requestId, status: 'PENDING' },
      data: {
        status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        adminNote: adminNote || null,
        reviewedAt: new Date(),
      },
    });
    if (claimed.count !== 1) throw new Error('Permintaan sudah ditinjau atau tidak ditemukan.');
    const request = await tx.walletRequest.findUniqueOrThrow({ where: { id: requestId } });

    if (request.type === 'TOPUP' && decision === 'APPROVE') {
      const updatedUser = await tx.user.update({
        where: { id: request.userId },
        data: { balance: { increment: request.amount } },
      });
      await tx.walletTransaction.create({
        data: {
          code: makeCode('WLT'),
          userId: request.userId,
          type: 'TOPUP',
          amount: request.amount,
          balanceAfter: updatedUser.balance,
          description: `Top-up disetujui admin • ${request.code}`,
          reference: request.code,
        },
      });
    }

    if (request.type === 'REFUND' && decision === 'REJECT') {
      const updatedUser = await tx.user.update({
        where: { id: request.userId },
        data: { balance: { increment: request.amount } },
      });
      await tx.walletTransaction.create({
        data: {
          code: makeCode('WLT'),
          userId: request.userId,
          type: 'REFUND_REJECTED',
          amount: request.amount,
          balanceAfter: updatedUser.balance,
          description: `Dana refund ${request.code} dikembalikan karena pengajuan ditolak`,
          reference: request.code,
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: request.userId,
        title: `${request.type === 'TOPUP' ? 'Top-up' : 'Refund'} ${request.code} ${decision === 'APPROVE' ? 'disetujui' : 'ditolak'}`,
        message: decision === 'APPROVE'
          ? request.type === 'TOPUP'
            ? 'Saldo sudah ditambahkan oleh admin.'
            : 'Pengajuan disetujui dan refund manual telah ditandai selesai oleh admin.'
          : request.type === 'REFUND'
            ? 'Pengajuan ditolak dan dana yang ditahan sudah dikembalikan ke saldo.'
            : 'Pengajuan ditolak. Hubungi admin untuk detailnya.',
      },
    });
    await writeAudit(tx, admin.id, `${decision}_${request.type}`, 'WalletRequest', request.id, request.code);
  });
  refreshWallet();
}

export async function adjustUserBalanceAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get('userId') || '');
  const amount = Number(formData.get('amount'));
  const description = String(formData.get('description') || '').trim();
  if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 10000000) throw new Error('Nominal penyesuaian tidak valid.');
  if (description.length < 4) throw new Error('Alasan penyesuaian wajib diisi.');

  await db.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({
      where: {
        id: userId,
        ...(amount < 0 ? { balance: { gte: Math.abs(amount) } } : {}),
      },
      data: { balance: amount > 0 ? { increment: amount } : { decrement: Math.abs(amount) } },
    });
    if (updated.count !== 1) throw new Error('Member tidak ditemukan atau saldo tidak mencukupi.');
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    await tx.walletTransaction.create({
      data: {
        code: makeCode('WLT'),
        userId,
        type: 'ADJUSTMENT',
        amount,
        balanceAfter: user.balance,
        description: `Penyesuaian admin: ${description}`,
      },
    });
    await tx.notification.create({
      data: { userId, title: 'Saldo disesuaikan admin', message: `${description} • ${amount > 0 ? '+' : ''}Rp ${amount.toLocaleString('id-ID')}` },
    });
    await writeAudit(tx, admin.id, 'ADJUST_BALANCE', 'User', userId, `${amount}: ${description}`);
  });
  refreshWallet();
}
