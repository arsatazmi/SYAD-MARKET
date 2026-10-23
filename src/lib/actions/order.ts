'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { orderSchema } from '@/lib/validation';
import { makeCode, normalizeWhatsapp } from '@/lib/format';
import { ActionError, actionErrorMessage } from '@/lib/action-error';
import type { ActionState } from '@/lib/types';

function refreshOrder(code: string) {
  revalidatePath('/dashboard');
  revalidatePath('/orders');
  revalidatePath(`/orders/${code}`);
  revalidatePath('/admin');
  revalidatePath('/admin/orders');
}

export async function createOrderAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = orderSchema.safeParse({
    productId: formData.get('productId'),
    customerName: formData.get('customerName'),
    whatsapp: formData.get('whatsapp'),
    packageDetails: formData.get('packageDetails') || undefined,
    target: formData.get('target') || undefined,
    notes: formData.get('notes') || undefined,
    quantity: formData.get('quantity') || 1,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Data order tidak valid.' };

  const input = parsed.data;
  const product = await db.product.findFirst({
    where: { id: input.productId, active: true, category: { active: true } },
    include: { category: true },
  });
  if (!product) return { error: 'Layanan tidak ditemukan atau sudah dinonaktifkan.' };
  if (input.quantity < product.minQuantity || input.quantity > product.maxQuantity) {
    return { error: `Jumlah harus antara ${product.minQuantity.toLocaleString('id-ID')} dan ${product.maxQuantity.toLocaleString('id-ID')}.` };
  }
  if (product.kind === 'SMM' && !input.target) {
    return { error: 'Link atau username target wajib diisi untuk layanan SMM.' };
  }
  if (product.requiresQuote && !input.packageDetails) {
    return { error: 'Tulis detail paket yang diinginkan agar admin dapat menentukan harga.' };
  }
  if (product.slug === 'murband-whatsapp' && !input.target) {
    return { error: 'Link saluran WhatsApp wajib diisi untuk produk ini.' };
  }
  if (product.stock !== null && input.quantity > product.stock) {
    return { error: `Stok tersisa ${product.stock}.` };
  }

  const total = product.requiresQuote
    ? 0
    : product.kind === 'SMM'
      ? Math.ceil((product.price * input.quantity) / 1000)
      : product.price * input.quantity;
  if (!product.requiresQuote && (!Number.isSafeInteger(total) || total < 1 || total > 2000000000)) {
    return { error: 'Total order melebihi batas yang dapat diproses. Kurangi jumlah atau hubungi admin.' };
  }

  const order = await db.order.create({
    data: {
      code: makeCode('VNX'),
      userId: user.id,
      productId: product.id,
      productName: product.name,
      categoryName: product.category.name,
      packageDetails: input.packageDetails || null,
      target: input.target || null,
      quantity: input.quantity,
      unitPrice: product.price,
      total,
      status: product.requiresQuote ? 'PENDING_QUOTE' : 'PENDING_PAYMENT',
      customerName: input.customerName,
      whatsapp: normalizeWhatsapp(input.whatsapp),
      notes: input.notes || null,
    },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      title: `Order ${order.code} dibuat`,
      message: product.requiresQuote
        ? `${product.name} menunggu penetapan harga oleh admin.`
        : `${product.name} menunggu pembayaran ${total.toLocaleString('id-ID')}.`,
    },
  });

  refreshOrder(order.code);
  redirect(`/orders/${order.code}`);
}

export async function markQrisPaidAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const code = String(formData.get('code') || '');
  const order = await db.order.findFirst({ where: { code, userId: user.id } });
  if (!order) return { error: 'Order tidak ditemukan.' };
  if (order.total <= 0 || order.status === 'PENDING_QUOTE') return { error: 'Harga order belum ditetapkan admin.' };
  if (order.paymentStatus !== 'UNPAID' || order.status !== 'PENDING_PAYMENT') {
    return { error: 'Status order sudah berubah. Muat ulang halaman.' };
  }

  try {
    await db.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: {
          id: order.id,
          userId: user.id,
          total: { gt: 0 },
          paymentStatus: 'UNPAID',
          status: 'PENDING_PAYMENT',
        },
        data: { paymentMethod: 'QRIS', paymentStatus: 'PENDING_REVIEW', status: 'PENDING_REVIEW' },
      });
      if (claimed.count !== 1) throw new ActionError('Status order sudah berubah. Muat ulang halaman.');

      await tx.notification.create({
        data: {
          userId: user.id,
          title: `Konfirmasi QRIS ${order.code}`,
          message: 'Konfirmasi sudah dicatat. Admin akan memeriksa pembayaran secara manual.',
        },
      });
    });
  } catch (error) {
    return { error: actionErrorMessage(error, 'Konfirmasi QRIS gagal disimpan. Silakan coba lagi.') };
  }

  refreshOrder(code);
  return { success: 'Konfirmasi tercatat. Jangan lupa kirim bukti melalui WhatsApp admin.' };
}

export async function payWithBalanceAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const sessionUser = await requireUser();
  const code = String(formData.get('code') || '');

  try {
    await db.$transaction(async (tx) => {
      const order = await tx.order.findFirst({ where: { code, userId: sessionUser.id } });
      if (!order) throw new ActionError('Order tidak ditemukan.');
      if (order.total <= 0 || order.status === 'PENDING_QUOTE') throw new ActionError('Harga order belum ditetapkan admin.');
      if (order.paymentStatus !== 'UNPAID' || order.status !== 'PENDING_PAYMENT') {
        throw new ActionError('Order sudah dibayar atau statusnya berubah.');
      }

      // Claim the order before touching the wallet. Concurrent requests can only claim it once;
      // a failed debit rolls this status change back together with the rest of the transaction.
      const claimed = await tx.order.updateMany({
        where: {
          id: order.id,
          userId: sessionUser.id,
          total: order.total,
          paymentStatus: 'UNPAID',
          status: 'PENDING_PAYMENT',
        },
        data: {
          paymentMethod: 'BALANCE',
          paymentStatus: 'PAID',
          status: 'PROCESSING',
          paidAt: new Date(),
        },
      });
      if (claimed.count !== 1) throw new ActionError('Order sudah dibayar atau statusnya berubah.');

      const debit = await tx.user.updateMany({
        where: { id: sessionUser.id, active: true, balance: { gte: order.total } },
        data: { balance: { decrement: order.total } },
      });
      if (debit.count !== 1) throw new ActionError('Saldo tidak cukup. Silakan top-up atau gunakan QRIS.');

      const updatedUser = await tx.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
      await tx.walletTransaction.create({
        data: {
          code: makeCode('WLT'),
          userId: sessionUser.id,
          type: 'ORDER_PAYMENT',
          amount: -order.total,
          balanceAfter: updatedUser.balance,
          description: `Pembayaran ${order.code} • ${order.productName}`,
          reference: order.code,
        },
      });
      await tx.notification.create({
        data: {
          userId: sessionUser.id,
          title: `Pembayaran saldo berhasil`,
          message: `${order.code} sudah dibayar dan masuk antrean proses admin.`,
        },
      });
    });
  } catch (error) {
    return { error: actionErrorMessage(error, 'Pembayaran saldo gagal. Tidak ada perubahan yang disimpan.') };
  }

  revalidatePath('/wallet');
  refreshOrder(code);
  return { success: 'Pembayaran saldo berhasil. Order sedang diproses admin.' };
}

export async function cancelOrderAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const code = String(formData.get('code') || '');
  const order = await db.order.findFirst({ where: { code, userId: user.id } });
  if (!order) return { error: 'Order tidak ditemukan.' };
  if (order.paymentStatus !== 'UNPAID' || !['PENDING_QUOTE', 'PENDING_PAYMENT'].includes(order.status)) {
    return { error: 'Order yang sudah dikonfirmasi/dibayar hanya dapat dibatalkan oleh admin.' };
  }

  try {
    await db.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: {
          id: order.id,
          userId: user.id,
          paymentStatus: 'UNPAID',
          status: { in: ['PENDING_QUOTE', 'PENDING_PAYMENT'] },
        },
        data: { status: 'CANCELLED' },
      });
      if (claimed.count !== 1) throw new ActionError('Status order sudah berubah. Muat ulang halaman.');

      await tx.notification.create({
        data: { userId: user.id, title: `Order ${code} dibatalkan`, message: 'Order dibatalkan oleh member.' },
      });
    });
  } catch (error) {
    return { error: actionErrorMessage(error, 'Order gagal dibatalkan. Silakan coba lagi.') };
  }

  refreshOrder(code);
  return { success: 'Order berhasil dibatalkan.' };
}
