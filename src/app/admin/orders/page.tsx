import { CheckCircle2, FileClock, MessageCircle, Search, XCircle } from 'lucide-react';
import type { OrderStatus, Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { cancelOrRefundOrderAction, markOrderPaidAction, setOrderQuoteAction, updateOrderFulfillmentAction } from '@/lib/actions/admin-orders';
import { formatDate, rupiah } from '@/lib/format';
import { StatusBadge } from '@/components/status-badge';
import { SubmitButton } from '@/components/submit-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kelola Order' };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; search?: string }> }) {
  await requireAdmin();
  const { status, search } = await searchParams;
  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status as OrderStatus;
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { productName: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { user: { username: { contains: search, mode: 'insensitive' } } },
    ];
  }
  const orders = await db.order.findMany({ where, include: { user: { select: { username: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><FileClock size={12} /> ORDER MANAGEMENT</span><h1>Kelola Order</h1><p>{orders.length} order ditampilkan • maksimal 100 data terbaru.</p></div></div>
      <form className="filter-bar" action="/admin/orders">
        <div className="field search-box" style={{ flex: 1, minWidth: 230 }}><Search size={16} /><input className="input" name="search" defaultValue={search || ''} placeholder="Kode, produk, pembeli, username..." /></div>
        <div className="field"><select name="status" defaultValue={status || ''} aria-label="Filter status"><option value="">Semua Status</option>{['PENDING_QUOTE', 'PENDING_PAYMENT', 'PENDING_REVIEW', 'PROCESSING', 'PARTIAL', 'COMPLETED', 'CANCELLED', 'REJECTED', 'REFUNDED'].map((item) => <option value={item} key={item}>{item.replaceAll('_', ' ')}</option>)}</select></div>
        <button className="btn btn-primary" type="submit">FILTER</button>
      </form>

      <div>
        {orders.map((order) => {
          const closed = ['CANCELLED', 'REJECTED', 'REFUNDED'].includes(order.status);
          return (
            <article className="admin-card" id={`order-${order.id}`} key={order.id}>
              <div className="admin-card-head">
                <div><div className="cluster"><span className="code">{order.code}</span><StatusBadge status={order.status} /><StatusBadge status={order.paymentStatus} /></div><h3 style={{ marginTop: 9 }}>{order.productName}</h3><p>@{order.user.username} • {order.customerName} • {formatDate(order.createdAt)}</p></div>
                <strong className="display text-cyan">{order.total ? rupiah(order.total) : 'PERLU QUOTE'}</strong>
              </div>
              <div className="detail-list">
                <div className="detail-item"><span>WhatsApp</span><strong><a href={`https://wa.me/${order.whatsapp}`} target="_blank" rel="noopener" className="text-cyan"><MessageCircle size={12} /> {order.whatsapp}</a></strong></div>
                <div className="detail-item"><span>Jumlah</span><strong>{order.quantity.toLocaleString('id-ID')}</strong></div>
                {order.target ? <div className="detail-item"><span>Target</span><strong>{order.target}</strong></div> : null}
                {order.packageDetails ? <div className="detail-item"><span>Detail Paket</span><strong>{order.packageDetails}</strong></div> : null}
                {order.notes ? <div className="detail-item"><span>Catatan Member</span><strong>{order.notes}</strong></div> : null}
              </div>

              {order.status === 'PENDING_QUOTE' ? (
                <form action={setOrderQuoteAction} className="form-grid admin-form panel-pad" style={{ marginTop: 14 }}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <div className="field"><label>Tetapkan Total (Rupiah)</label><input name="total" type="number" min="1000" step="500" required placeholder="Contoh: 50000" /></div>
                  <div className="field" style={{ justifyContent: 'end' }}><SubmitButton className="btn btn-primary">KIRIM HARGA KE MEMBER</SubmitButton></div>
                </form>
              ) : null}

              {order.total > 0 && !['PAID', 'REFUNDED'].includes(order.paymentStatus) && !closed ? (
                <form action={markOrderPaidAction} style={{ marginTop: 14 }}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <SubmitButton className="btn btn-success"><CheckCircle2 size={15} /> VERIFIKASI PEMBAYARAN & MULAI PROSES</SubmitButton>
                </form>
              ) : null}

              {order.paymentStatus === 'PAID' && !closed ? (
                <form action={updateOrderFulfillmentAction} className="stack admin-form panel-pad" style={{ marginTop: 14 }}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <div className="form-grid">
                    <div className="field"><label>Status Fulfilment</label><select name="status" defaultValue={['PROCESSING', 'PARTIAL', 'COMPLETED', 'REJECTED'].includes(order.status) ? order.status : 'PROCESSING'}><option value="PROCESSING">Sedang Diproses</option><option value="PARTIAL">Sebagian Selesai</option><option value="COMPLETED">Selesai</option><option value="REJECTED">Ditolak</option></select></div>
                    <div className="field"><label>Catatan Admin</label><input name="adminNote" defaultValue={order.adminNote || ''} placeholder="Progress, estimasi, atau catatan penyelesaian" /></div>
                    <div className="field field-full"><label>Hasil Pesanan untuk Member</label><textarea name="resultData" defaultValue={order.resultData || ''} placeholder="Username, password, link, nomor, detail akun, atau hasil lainnya..." /></div>
                  </div>
                  <SubmitButton className="btn btn-primary">SIMPAN STATUS & HASIL</SubmitButton>
                </form>
              ) : null}

              {!closed ? (
                <form action={cancelOrRefundOrderAction} className="cluster" style={{ marginTop: 14 }}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <input className="input" name="adminNote" placeholder="Alasan batal / catatan refund (opsional)" style={{ flex: 1, minWidth: 220 }} />
                  <SubmitButton className="btn btn-danger btn-sm"><XCircle size={14} /> {order.paymentStatus === 'PAID' ? 'BATALKAN / REFUND' : 'BATALKAN ORDER'}</SubmitButton>
                </form>
              ) : null}
              {order.resultData && closed ? <div className="result-box" style={{ marginTop: 14 }}><strong>Hasil tersimpan</strong><pre>{order.resultData}</pre></div> : null}
            </article>
          );
        })}
      </div>
      {!orders.length ? <div className="empty-state">Tidak ada order yang sesuai filter.</div> : null}
    </div>
  );
}
