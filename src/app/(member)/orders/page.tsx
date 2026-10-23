import Link from 'next/link';
import { FileClock, PlusCircle, ShoppingBag } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { formatDate, rupiah } from '@/lib/format';
import { StatusBadge } from '@/components/status-badge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order Saya' };

const filters = [
  ['', 'Semua'],
  ['PENDING_PAYMENT', 'Belum Bayar'],
  ['PENDING_REVIEW', 'Verifikasi'],
  ['PROCESSING', 'Diproses'],
  ['COMPLETED', 'Sukses'],
  ['CANCELLED', 'Batal'],
] as const;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const { status } = await searchParams;
  const orders = await db.order.findMany({
    where: { userId: user.id, ...(status ? { status: status as never } : {}) },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><FileClock size={12} /> RIWAYAT TRANSAKSI</span><h1>Order Saya</h1><p>Semua status dan hasil pembelian tersimpan di akun.</p></div><Link href="/#layanan" className="btn btn-primary"><PlusCircle size={16} /> ORDER BARU</Link></div>
      <div className="filter-bar cluster">{filters.map(([value, label]) => <Link key={value} className={`btn btn-sm ${status === value || (!status && !value) ? 'btn-primary' : 'btn-ghost'}`} href={value ? `/orders?status=${value}` : '/orders'}>{label}</Link>)}</div>
      <section className="panel panel-pad">
        {orders.length ? <div className="data-list">{orders.map((order) => (
          <Link href={`/orders/${order.code}`} className="data-row" key={order.id}>
            <div className="data-row-main"><div className="cluster"><span className="badge">{order.categoryName}</span><StatusBadge status={order.status} /></div><strong style={{ marginTop: 8 }}>{order.productName}</strong><small>{order.code} • {formatDate(order.createdAt)} • Qty {order.quantity.toLocaleString('id-ID')}</small></div>
            <div className="data-row-end"><strong>{order.total ? rupiah(order.total) : 'Menunggu harga'}</strong><small>Lihat detail →</small></div>
          </Link>
        ))}</div> : <div className="empty-state"><ShoppingBag size={30} /><div>Tidak ada order pada filter ini.</div></div>}
      </section>
    </div>
  );
}
