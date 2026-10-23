import Link from 'next/link';
import { Bell, BellRing, CheckCircle2, Clock3, FileClock, PlusCircle, ShieldCheck, ShoppingBag, TrendingUp, WalletCards } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { formatDate, orderStatusLabels, rupiah } from '@/lib/format';
import { StatusBadge } from '@/components/status-badge';
import { ManualNotice } from '@/components/state-message';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard Member' };

export default async function DashboardPage() {
  const user = await requireUser();
  const [recentOrders, activeCount, completedCount, unreadCount, spent, transactions, announcements] = await Promise.all([
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    db.order.count({ where: { userId: user.id, status: { in: ['PENDING_QUOTE', 'PENDING_PAYMENT', 'PENDING_REVIEW', 'PROCESSING', 'PARTIAL'] } } }),
    db.order.count({ where: { userId: user.id, status: 'COMPLETED' } }),
    db.notification.count({ where: { userId: user.id, isRead: false } }),
    db.order.aggregate({ where: { userId: user.id, status: { in: ['COMPLETED', 'PARTIAL'] }, paymentStatus: 'PAID' }, _sum: { total: true } }),
    db.walletTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 4 }),
    db.announcement.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, take: 2 }),
  ]);

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}>
        <div><span className="eyebrow">MEMBER DASHBOARD</span><h1>Halo, {user.name.split(' ')[0]} 👋</h1><p>Pantau order, saldo, dan hasil pembelian dari satu tempat.</p></div>
        <Link href="/#layanan" className="btn btn-primary"><PlusCircle size={16} /> ORDER BARU</Link>
      </div>
      <ManualNotice />
      <div className="metric-grid">
        <div className="panel metric-card"><WalletCards size={20} /><small>SALDO WEBSITE</small><strong>{rupiah(user.balance)}</strong><span><Link href="/wallet">Top-up manual →</Link></span></div>
        <div className="panel metric-card"><Clock3 size={20} /><small>ORDER AKTIF</small><strong>{activeCount}</strong><span>Menunggu & diproses</span></div>
        <div className="panel metric-card"><CheckCircle2 size={20} /><small>ORDER SELESAI</small><strong>{completedCount}</strong><span>Total belanja {rupiah(spent._sum.total || 0)}</span></div>
        <div className="panel metric-card"><Bell size={20} /><small>NOTIFIKASI</small><strong>{unreadCount}</strong><span><Link href="/notifications">Buka kotak masuk →</Link></span></div>
      </div>

      <div className="dashboard-grid">
        <section className="panel panel-pad">
          <div className="section-heading"><div><span className="eyebrow">TRANSAKSI</span><h2>Order Terbaru</h2></div><Link href="/orders" className="btn btn-ghost btn-sm">LIHAT SEMUA</Link></div>
          {recentOrders.length ? <div className="data-list">{recentOrders.map((order) => (
            <Link href={`/orders/${order.code}`} className="data-row" key={order.id}>
              <div className="data-row-main"><strong>{order.productName}</strong><small>{order.code} • {formatDate(order.createdAt)}</small></div>
              <div className="data-row-end"><strong>{order.total ? rupiah(order.total) : 'Menunggu harga'}</strong><div style={{ marginTop: 6 }}><StatusBadge status={order.status} /></div></div>
            </Link>
          ))}</div> : <div className="empty-state"><ShoppingBag size={28} /><div>Belum ada order. Pilih layanan di etalase untuk memulai.</div><Link href="/#layanan" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>LIHAT LAYANAN</Link></div>}
        </section>

        <div className="stack">
          <section className="panel panel-pad">
            <div className="section-heading"><div><span className="eyebrow">AKSES CEPAT</span><h2>Menu Member</h2></div></div>
            <div className="data-list">
              <Link href="/smm" className="data-row"><div className="cluster"><TrendingUp size={18} className="text-cyan" /><strong>SMM Panel</strong></div><span>→</span></Link>
              <Link href="/wallet" className="data-row"><div className="cluster"><WalletCards size={18} className="text-green" /><strong>Top-up Saldo</strong></div><span>→</span></Link>
              <Link href="/support" className="data-row"><div className="cluster"><ShieldCheck size={18} className="text-yellow" /><strong>Garansi & Support</strong></div><span>→</span></Link>
            </div>
          </section>
          <section className="panel panel-pad">
            <div className="section-heading"><div><span className="eyebrow">INFORMASI</span><h2>Pengumuman</h2></div></div>
            <div className="stack">{announcements.map((item) => <div className="alert alert-info" key={item.id}><BellRing size={16} /><div><strong>{item.title}</strong><br />{item.message}</div></div>)}</div>
          </section>
        </div>
      </div>

      <section className="panel panel-pad">
        <div className="section-heading"><div><span className="eyebrow">SALDO</span><h2>Mutasi Terakhir</h2></div><Link href="/wallet" className="btn btn-ghost btn-sm">DETAIL SALDO</Link></div>
        {transactions.length ? <div className="data-list">{transactions.map((item) => <div className="data-row" key={item.id}><div className="data-row-main"><strong>{item.description}</strong><small>{formatDate(item.createdAt)} • Saldo {rupiah(item.balanceAfter)}</small></div><strong className={item.amount >= 0 ? 'text-green' : 'text-red'}>{item.amount >= 0 ? '+' : ''}{rupiah(item.amount)}</strong></div>)}</div> : <div className="empty-state">Belum ada mutasi saldo.</div>}
      </section>
    </div>
  );
}
