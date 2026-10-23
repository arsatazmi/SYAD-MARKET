import { CircleDollarSign, WalletCards } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { getStoreSetting } from '@/lib/data';
import { formatDate, rupiah } from '@/lib/format';
import { StatusBadge } from '@/components/status-badge';
import { WalletRequestForms } from '@/components/wallet-forms';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Saldo & Top-up' };

export default async function WalletPage() {
  const user = await requireUser();
  const [setting, requests, transactions] = await Promise.all([
    getStoreSetting(),
    db.walletRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }),
    db.walletTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 30 }),
  ]);

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><WalletCards size={12} /> KEUANGAN MEMBER</span><h1>Saldo Website</h1><p>Top-up dan refund sama-sama dikonfirmasi manual oleh admin.</p></div><div className="neon-panel panel-pad" style={{ padding: '12px 17px' }}><small className="muted">Saldo tersedia</small><strong className="display text-cyan" style={{ display: 'block', fontSize: 22 }}>{rupiah(user.balance)}</strong></div></div>
      <WalletRequestForms whatsapp={user.whatsapp || ''} qrisPath={setting.qrisPath} adminWhatsapp={setting.whatsapp} />

      <section className="panel panel-pad">
        <div className="section-heading"><div><span className="eyebrow">PERMINTAAN</span><h2>Riwayat Top-up & Refund</h2></div></div>
        {requests.length ? <div className="data-list">{requests.map((request) => <div className="data-row" key={request.id}><div className="data-row-main"><div className="cluster"><StatusBadge status={request.type} /><StatusBadge status={request.status} /></div><strong style={{ marginTop: 7 }}>{request.code} • {rupiah(request.amount)}</strong><small>{formatDate(request.createdAt)}{request.adminNote ? ` • Admin: ${request.adminNote}` : ''}</small></div></div>)}</div> : <div className="empty-state"><CircleDollarSign size={28} /><div>Belum ada permintaan top-up atau refund.</div></div>}
      </section>

      <section className="panel panel-pad">
        <div className="section-heading"><div><span className="eyebrow">MUTASI</span><h2>Rekap Saldo</h2></div></div>
        {transactions.length ? <div className="data-list">{transactions.map((item) => <div className="data-row" key={item.id}><div className="data-row-main"><strong>{item.description}</strong><small>{item.code} • {formatDate(item.createdAt)} • Saldo akhir {rupiah(item.balanceAfter)}</small></div><strong className={item.amount >= 0 ? 'text-green' : 'text-red'}>{item.amount >= 0 ? '+' : ''}{rupiah(item.amount)}</strong></div>)}</div> : <div className="empty-state">Belum ada mutasi saldo.</div>}
      </section>
    </div>
  );
}
