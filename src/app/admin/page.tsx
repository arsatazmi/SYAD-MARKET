import Link from 'next/link';
import { Activity, Boxes, CheckCircle2, CircleDollarSign, Clock3, FileClock, ShieldCheck, UsersRound, WalletCards } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { formatDate, rupiah } from '@/lib/format';
import { StatusBadge } from '@/components/status-badge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [members, activeOrders, paymentReviews, walletPending, products, revenue, recentOrders, recentRequests, audits] = await Promise.all([
    db.user.count({ where: { role: 'MEMBER' } }),
    db.order.count({ where: { status: { in: ['PENDING_QUOTE', 'PENDING_PAYMENT', 'PENDING_REVIEW', 'PROCESSING', 'PARTIAL'] } } }),
    db.order.count({ where: { paymentStatus: 'PENDING_REVIEW' } }),
    db.walletRequest.count({ where: { status: 'PENDING' } }),
    db.product.count({ where: { active: true } }),
    db.order.aggregate({ where: { status: { in: ['COMPLETED', 'PARTIAL'] }, paymentStatus: 'PAID' }, _sum: { total: true } }),
    db.order.findMany({ include: { user: { select: { username: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 6 }),
    db.walletRequest.findMany({ where: { status: 'PENDING' }, include: { user: { select: { username: true } } }, orderBy: { createdAt: 'asc' }, take: 5 }),
    db.auditLog.findMany({ include: { actor: { select: { username: true } } }, orderBy: { createdAt: 'desc' }, take: 6 }),
  ]);

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><ShieldCheck size={12} /> ADMIN CONTROL</span><h1>Dashboard Admin</h1><p>Semua pembayaran dan layanan berjalan dalam mode manual.</p></div><Link href="/admin/orders" className="btn btn-primary"><FileClock size={16} /> KELOLA ORDER</Link></div>
      <div className="metric-grid">
        <div className="panel metric-card"><FileClock size={20} /><small>ORDER AKTIF</small><strong>{activeOrders}</strong><span>{paymentReviews} menunggu verifikasi QRIS</span></div>
        <div className="panel metric-card"><CircleDollarSign size={20} /><small>OMZET SELESAI</small><strong>{rupiah(revenue._sum.total || 0)}</strong><span>Order completed/partial berbayar</span></div>
        <div className="panel metric-card"><UsersRound size={20} /><small>MEMBER</small><strong>{members}</strong><span>{products} layanan aktif</span></div>
        <div className="panel metric-card"><WalletCards size={20} /><small>TOP-UP / REFUND</small><strong>{walletPending}</strong><span>Permintaan menunggu tinjauan</span></div>
      </div>

      <div className="dashboard-grid">
        <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow">TERBARU</span><h2>Order Masuk</h2></div><Link href="/admin/orders" className="btn btn-ghost btn-sm">SEMUA ORDER</Link></div>
          {recentOrders.length ? <div className="data-list">{recentOrders.map((order) => <Link href={`/admin/orders?search=${order.code}`} className="data-row" key={order.id}><div className="data-row-main"><strong>{order.productName}</strong><small>{order.code} • @{order.user.username} • {formatDate(order.createdAt)}</small></div><div className="data-row-end"><strong>{order.total ? rupiah(order.total) : 'Perlu quote'}</strong><div style={{ marginTop: 6 }}><StatusBadge status={order.status} /></div></div></Link>)}</div> : <div className="empty-state">Belum ada order.</div>}
        </section>
        <div className="stack">
          <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow">PERLU TINJAUAN</span><h2>Saldo</h2></div></div>{recentRequests.length ? <div className="data-list">{recentRequests.map((request) => <Link href="/admin/wallet" className="data-row" key={request.id}><div className="data-row-main"><strong>{request.code} • {rupiah(request.amount)}</strong><small>{request.type} • @{request.user.username}</small></div><StatusBadge status={request.status} /></Link>)}</div> : <div className="empty-state"><CheckCircle2 size={25} /><div>Tidak ada antrean saldo.</div></div>}</section>
          <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow">AKTIVITAS</span><h2>Audit Log</h2></div></div>{audits.length ? <div className="data-list">{audits.map((log) => <div className="data-row" key={log.id}><div className="data-row-main"><strong>{log.action}</strong><small>{log.entity} • @{log.actor?.username || 'system'} • {formatDate(log.createdAt)}</small></div><Activity size={15} className="text-cyan" /></div>)}</div> : <div className="empty-state">Belum ada aktivitas admin.</div>}</section>
        </div>
      </div>
    </div>
  );
}
