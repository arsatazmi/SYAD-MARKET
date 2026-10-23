import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, Info, MessageSquareText, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { getStoreSetting } from '@/lib/data';
import { claimStatusLabels, formatDate, rupiah, whatsappUrl } from '@/lib/format';
import { StatusBadge } from '@/components/status-badge';
import { PaymentActions } from '@/components/payment-actions';
import { ReviewForm, WarrantyForm } from '@/components/order-support-forms';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await requireUser();
  const { code } = await params;
  const [order, setting] = await Promise.all([
    db.order.findFirst({ where: { code, userId: user.id }, include: { review: true, warrantyClaims: { orderBy: { createdAt: 'desc' } } } }),
    getStoreSetting(),
  ]);
  if (!order) notFound();

  const canPay = order.total > 0 && order.status === 'PENDING_PAYMENT' && order.paymentStatus === 'UNPAID';
  const canCancel = order.paymentStatus === 'UNPAID' && ['PENDING_QUOTE', 'PENDING_PAYMENT'].includes(order.status);
  const waMessage = `Halo Admin SYAD MARKET, saya ingin konfirmasi pembayaran.\n\nKode: ${order.code}\nProduk: ${order.productName}\nTotal: ${rupiah(order.total)}\nNama: ${order.customerName}\n\nBerikut bukti pembayaran saya.`;

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}>
        <div><Link href="/orders" className="eyebrow"><ArrowLeft size={12} /> KEMBALI KE ORDER</Link><h1 className="code" style={{ fontSize: 24 }}>{order.code}</h1><p>{order.productName}</p></div>
        <div className="cluster"><StatusBadge status={order.status} /><StatusBadge status={order.paymentStatus} /></div>
      </div>

      <div className="detail-grid">
        <div className="stack">
          <section className="panel panel-pad">
            <div className="section-heading"><div><span className="eyebrow">DETAIL PESANAN</span><h2>Informasi Order</h2></div><span className="badge badge-cyan">MANUAL</span></div>
            <div className="detail-list">
              <div className="detail-item"><span>Produk</span><strong>{order.productName}</strong></div>
              <div className="detail-item"><span>Kategori</span><strong>{order.categoryName}</strong></div>
              <div className="detail-item"><span>Jumlah</span><strong>{order.quantity.toLocaleString('id-ID')}</strong></div>
              <div className="detail-item"><span>Total</span><strong>{order.total ? rupiah(order.total) : 'Menunggu penetapan admin'}</strong></div>
              <div className="detail-item"><span>Pembeli</span><strong>{order.customerName}<br />{order.whatsapp}</strong></div>
              {order.target ? <div className="detail-item"><span>Target</span><strong>{order.target}</strong></div> : null}
              {order.packageDetails ? <div className="detail-item"><span>Detail Paket</span><strong>{order.packageDetails}</strong></div> : null}
              {order.notes ? <div className="detail-item"><span>Catatan</span><strong>{order.notes}</strong></div> : null}
              <div className="detail-item"><span>Dibuat</span><strong>{formatDate(order.createdAt)}</strong></div>
            </div>
          </section>

          <section className="panel panel-pad">
            <div className="section-heading"><div><span className="eyebrow">PROGRESS</span><h2>Status Pengerjaan</h2></div></div>
            <div className="timeline">
              <div className="timeline-item done"><span className="timeline-dot" /><div><strong>Order dibuat</strong><small>{formatDate(order.createdAt)}</small></div></div>
              <div className={`timeline-item ${order.paymentStatus === 'PAID' ? 'done' : 'current'}`}><span className="timeline-dot" /><div><strong>{order.status === 'PENDING_QUOTE' ? 'Menunggu harga dari admin' : order.paymentStatus === 'PENDING_REVIEW' ? 'Pembayaran sedang diverifikasi' : 'Pembayaran'}</strong><small>{order.paidAt ? formatDate(order.paidAt) : 'Diverifikasi manual oleh admin'}</small></div></div>
              <div className={`timeline-item ${['COMPLETED'].includes(order.status) ? 'done' : ['PROCESSING', 'PARTIAL'].includes(order.status) ? 'current' : ''}`}><span className="timeline-dot" /><div><strong>Diproses admin</strong><small>Hasil dimasukkan manual ke detail order</small></div></div>
              <div className={`timeline-item ${order.status === 'COMPLETED' ? 'done' : ''}`}><span className="timeline-dot" /><div><strong>Selesai</strong><small>{order.completedAt ? formatDate(order.completedAt) : 'Belum selesai'}</small></div></div>
            </div>
          </section>

          {order.resultData ? <section className="result-box"><span className="eyebrow"><CheckCircle2 size={12} /> HASIL PESANAN</span><h2 className="display" style={{ margin: 0 }}>Data dari Admin</h2><pre>{order.resultData}</pre></section> : null}
          {order.adminNote ? <div className="alert alert-info"><Info size={17} /><div><strong>Catatan Admin</strong><br />{order.adminNote}</div></div> : null}
        </div>

        <div className="stack">
          <section className="neon-panel panel-pad">
            <span className="eyebrow"><CreditCard size={12} /> PEMBAYARAN MANUAL</span>
            {order.status === 'PENDING_QUOTE' ? <div className="empty-state"><Clock3 size={27} /><div>Admin sedang meninjau detail paket. Pembayaran terbuka setelah harga ditetapkan.</div></div> : (
              <>
                <div className="payment-total"><small>Total Pembayaran</small><strong>{rupiah(order.total)}</strong></div>
                {['PENDING_PAYMENT', 'PENDING_REVIEW'].includes(order.status) ? <div className="qris-box"><img src={setting.qrisPath} alt="QRIS SYAD MARKET" width={2531} height={2560} /></div> : null}
                {canPay ? <a className="btn btn-ghost btn-block" style={{ margin: '12px 0' }} href={whatsappUrl(setting.whatsapp, waMessage)} target="_blank" rel="noopener">KIRIM BUKTI KE WHATSAPP</a> : null}
                <div style={{ marginTop: 14 }}><PaymentActions code={order.code} total={order.total} balance={user.balance} canPay={canPay} canCancel={canCancel} /></div>
                {order.status === 'PENDING_REVIEW' ? <div className="alert alert-info" style={{ marginTop: 12 }}><Clock3 size={16} /><span>Bukti sudah dikonfirmasi member. Tunggu admin memeriksa pembayaran.</span></div> : null}
                {order.paymentStatus === 'PAID' ? <div className="alert alert-success"><CheckCircle2 size={16} /><span>Pembayaran sudah diverifikasi. Order dalam antrean admin.</span></div> : null}
              </>
            )}
          </section>
        </div>
      </div>

      {['COMPLETED', 'PARTIAL', 'PROCESSING'].includes(order.status) ? (
        <div className="detail-grid">
          {['COMPLETED', 'PARTIAL'].includes(order.status) ? <section className="panel panel-pad"><span className="eyebrow"><MessageSquareText size={12} /> ULASAN</span><h2 className="display" style={{ marginTop: 0 }}>Beri Penilaian</h2><ReviewForm orderId={order.id} />{order.review ? <small className="muted">Ulasan sebelumnya tersimpan. Mengirim ulang akan memperbaruinya dan menunggu moderasi.</small> : null}</section> : null}
          <section className="panel panel-pad"><span className="eyebrow"><ShieldCheck size={12} /> GARANSI</span><h2 className="display" style={{ marginTop: 0 }}>Klaim Garansi</h2><WarrantyForm orderId={order.id} /></section>
        </div>
      ) : null}

      {order.warrantyClaims.length ? <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow">RIWAYAT GARANSI</span><h2>Klaim pada Order Ini</h2></div></div><div className="data-list">{order.warrantyClaims.map((claim) => <div className="data-row" key={claim.id}><div className="data-row-main"><strong>{claim.code}</strong><small>{claim.description}</small>{claim.adminResponse ? <small>Admin: {claim.adminResponse}</small> : null}</div><StatusBadge status={claim.status} label={claimStatusLabels[claim.status]} /></div>)}</div></section> : null}
    </div>
  );
}
