'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { makeCode } from '@/lib/format';
import { writeAudit } from '@/lib/audit';
import type { OrderStatus } from '@prisma/client';

function refreshAdminOrder(code: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath('/dashboard');
  revalidatePath('/orders');
  revalidatePath(`/orders/${code}`);
  revalidatePath('/wallet');
}

export async function setOrderQuoteAction(formData: FormData) {
  const admin = await requireAdmin();
  const orderId = String(formData.get('orderId') || '');
  const total = Number(formData.get('total'));
  if (!Number.isInteger(total) || total < 1000 || total > 100000000) throw new Error('Harga penawaran tidak valid.');

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== 'PENDING_QUOTE') throw new Error('Order tidak menunggu penawaran.');

  await db.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: order.id, status: 'PENDING_QUOTE', paymentStatus: 'UNPAID' },
      data: { total, status: 'PENDING_PAYMENT' },
    });
    if (claimed.count !== 1) throw new Error('Status order sudah berubah. Muat ulang halaman.');

    await tx.notification.create({
      data: { userId: order.userId, title: `Harga ${order.code} sudah tersedia`, message: `Admin menetapkan total Rp ${total.toLocaleString('id-ID')}. Silakan pilih metode pembayaran.` },
    });
    await writeAudit(tx, admin.id, 'SET_QUOTE', 'Order', order.id, `${order.code}: ${total}`);
  });
  refreshAdminOrder(order.code);
}

export async function markOrderPaidAction(formData: FormData) {
  const admin = await requireAdmin();
  const orderId = String(formData.get('orderId') || '');
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.total <= 0) throw new Error('Order tidak valid.');
  if (order.paymentStatus === 'PAID') throw new Error('Order sudah ditandai lunas.');
  if (!['UNPAID', 'PENDING_REVIEW'].includes(order.paymentStatus)) throw new Error('Status pembayaran tidak dapat diubah.');
  if (!['PENDING_PAYMENT', 'PENDING_REVIEW'].includes(order.status)) throw new Error('Status order tidak dapat diverifikasi.');

  await db.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: {
        id: order.id,
        total: { gt: 0 },
        paymentStatus: { in: ['UNPAID', 'PENDING_REVIEW'] },
        status: { in: ['PENDING_PAYMENT', 'PENDING_REVIEW'] },
      },
      data: {
        paymentMethod: order.paymentMethod || 'QRIS',
        paymentStatus: 'PAID',
        status: 'PROCESSING',
        paidAt: new Date(),
      },
    });
    if (claimed.count !== 1) throw new Error('Order sudah dibayar atau statusnya berubah.');

    await tx.notification.create({
      data: { userId: order.userId, title: `Pembayaran ${order.code} diverifikasi`, message: 'Pembayaran sudah dikonfirmasi admin. Order masuk antrean proses.' },
    });
    await writeAudit(tx, admin.id, 'MARK_PAID', 'Order', order.id, order.code);
  });
  refreshAdminOrder(order.code);
}

export async function updateOrderFulfillmentAction(formData: FormData) {
  const admin = await requireAdmin();
  const orderId = String(formData.get('orderId') || '');
  const status = String(formData.get('status') || '');
  const allowed = ['PROCESSING', 'PARTIAL', 'COMPLETED', 'REJECTED'];
  if (!allowed.includes(status)) throw new Error('Status fulfilment tidak valid.');
  const resultData = String(formData.get('resultData') || '').trim();
  const adminNote = String(formData.get('adminNote') || '').trim();

  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order tidak ditemukan.');
    if (order.paymentStatus !== 'PAID') throw new Error('Order harus dibayar sebelum diproses.');
    if (status === 'COMPLETED' && !resultData && !adminNote) throw new Error('Isi hasil pesanan atau catatan penyelesaian.');

    if (status === 'COMPLETED') {
      // completedAt is the first-completion marker. Claiming it atomically makes stock
      // deduction idempotent even when two admins submit completion at the same time.
      const firstCompletion = await tx.order.updateMany({
        where: { id: order.id, paymentStatus: 'PAID', completedAt: null },
        data: { completedAt: new Date() },
      });

      if (firstCompletion.count === 1 && order.productId) {
        const product = await tx.product.findUnique({ where: { id: order.productId } });
        if (product?.stock !== null && product?.stock !== undefined) {
          const deducted = await tx.product.updateMany({
            where: { id: product.id, stock: { gte: order.quantity } },
            data: { stock: { decrement: order.quantity } },
          });
          if (deducted.count !== 1) {
            throw new Error(`Stok ${product.name} tidak cukup untuk menyelesaikan order ini.`);
          }
        }
      }
    }

    const updated = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: 'PAID' },
      data: {
        status: status as OrderStatus,
        resultData: resultData || order.resultData,
        adminNote: adminNote || order.adminNote,
      },
    });
    if (updated.count !== 1) throw new Error('Status pembayaran/order sudah berubah. Muat ulang halaman.');

    await tx.notification.create({
      data: {
        userId: order.userId,
        title: `Status ${order.code}: ${status}`,
        message: status === 'COMPLETED' ? 'Pesanan selesai. Hasil dapat dilihat pada detail order.' : 'Admin memperbarui status pesanan.',
      },
    });
    await writeAudit(tx, admin.id, `FULFILL_${status}`, 'Order', order.id, order.code);
  });

  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  refreshAdminOrder(order.code);
}

export async function cancelOrRefundOrderAction(formData: FormData) {
  const admin = await requireAdmin();
  const orderId = String(formData.get('orderId') || '');
  const note = String(formData.get('adminNote') || '').trim();

  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order tidak ditemukan.');
    if (['CANCELLED', 'REJECTED', 'REFUNDED'].includes(order.status)) throw new Error('Order sudah ditutup.');

    const refunded = order.paymentStatus === 'PAID';
    // The exact status predicate prevents a stale read from cancelling an order that
    // another request has just paid, and makes a balance refund possible only once.
    const claimed = await tx.order.updateMany({
      where: {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
      data: {
        status: refunded ? 'REFUNDED' : 'CANCELLED',
        paymentStatus: refunded ? 'REFUNDED' : order.paymentStatus,
        adminNote: note || order.adminNote,
      },
    });
    if (claimed.count !== 1) throw new Error('Status order sudah berubah. Muat ulang sebelum membatalkan/refund.');

    if (refunded && order.paymentMethod === 'BALANCE') {
      const updatedUser = await tx.user.update({
        where: { id: order.userId },
        data: { balance: { increment: order.total } },
      });
      await tx.walletTransaction.create({
        data: {
          code: makeCode('WLT'),
          userId: order.userId,
          type: 'REFUND',
          amount: order.total,
          balanceAfter: updatedUser.balance,
          description: `Refund saldo untuk ${order.code}`,
          reference: order.code,
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: order.userId,
        title: `${order.code} ${refunded ? 'dikembalikan' : 'dibatalkan'}`,
        message: refunded
          ? order.paymentMethod === 'BALANCE'
            ? 'Dana sudah dikembalikan ke saldo member.'
            : 'Admin menandai order sebagai refund setelah proses pengembalian manual.'
          : 'Order dibatalkan oleh admin.',
      },
    });
    await writeAudit(tx, admin.id, refunded ? 'REFUND_ORDER' : 'CANCEL_ORDER', 'Order', order.id, note || order.code);
  });
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  refreshAdminOrder(order.code);
}
