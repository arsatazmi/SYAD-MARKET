'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { walletRequestSchema } from '@/lib/validation';
import { makeCode, normalizeWhatsapp } from '@/lib/format';
import { ActionError, actionErrorMessage } from '@/lib/action-error';
import type { ActionState } from '@/lib/types';

function refreshWallet() {
  revalidatePath('/wallet');
  revalidatePath('/dashboard');
  revalidatePath('/admin');
  revalidatePath('/admin/wallet');
}

export async function createWalletRequestAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = walletRequestSchema.safeParse({
    type: formData.get('type'),
    amount: formData.get('amount'),
    whatsapp: formData.get('whatsapp'),
    note: formData.get('note') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Data tidak valid.' };
  const input = parsed.data;

  try {
    if (input.type === 'TOPUP') {
      const request = await db.walletRequest.create({
        data: {
          code: makeCode('TOP'),
          userId: user.id,
          type: 'TOPUP',
          amount: input.amount,
          whatsapp: normalizeWhatsapp(input.whatsapp),
          note: input.note || null,
        },
      });
      await db.notification.create({
        data: {
          userId: user.id,
          title: `Top-up ${request.code} menunggu verifikasi`,
          message: 'Bayar lewat QRIS lalu kirim bukti ke WhatsApp admin. Saldo ditambahkan setelah admin menyetujui.',
        },
      });
      refreshWallet();
      return { success: `Permintaan ${request.code} dibuat. Selesaikan pembayaran QRIS dan konfirmasi ke admin.` };
    }

    const request = await db.$transaction(async (tx) => {
      const debit = await tx.user.updateMany({
        where: { id: user.id, active: true, balance: { gte: input.amount } },
        data: { balance: { decrement: input.amount } },
      });
      if (debit.count !== 1) throw new ActionError('Saldo tidak cukup untuk pengajuan refund.');

      const created = await tx.walletRequest.create({
        data: {
          code: makeCode('RFD'),
          userId: user.id,
          type: 'REFUND',
          amount: input.amount,
          whatsapp: normalizeWhatsapp(input.whatsapp),
          note: input.note || null,
        },
      });
      const updatedUser = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
      await tx.walletTransaction.create({
        data: {
          code: makeCode('WLT'),
          userId: user.id,
          type: 'REFUND_HOLD',
          amount: -input.amount,
          balanceAfter: updatedUser.balance,
          description: `Dana ditahan untuk pengajuan refund ${created.code}`,
          reference: created.code,
        },
      });
      await tx.notification.create({
        data: {
          userId: user.id,
          title: `Refund ${created.code} diajukan`,
          message: 'Dana ditahan sementara. Admin akan memeriksa pengajuan dan memproses refund manual.',
        },
      });
      return created;
    });

    refreshWallet();
    return { success: `Pengajuan ${request.code} dibuat. Dana ditahan sampai admin meninjau.` };
  } catch (error) {
    return { error: actionErrorMessage(error, 'Permintaan gagal diproses. Tidak ada perubahan yang disimpan.') };
  }
}
