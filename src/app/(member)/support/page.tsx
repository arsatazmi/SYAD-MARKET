import Link from 'next/link';
import { Headphones, Info, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { getStoreSetting } from '@/lib/data';
import { formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/status-badge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Garansi & Support' };

export default async function SupportPage() {
  const user = await requireUser();
  const [claims, setting] = await Promise.all([
    db.warrantyClaim.findMany({ where: { userId: user.id }, include: { order: { select: { code: true, productName: true } } }, orderBy: { createdAt: 'desc' } }),
    getStoreSetting(),
  ]);
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><ShieldCheck size={12} /> SUPPORT MANUAL</span><h1>Garansi & Bantuan</h1><p>Ajukan klaim dari detail order yang sudah diproses atau selesai.</p></div><a className="btn btn-primary" href={`https://wa.me/${setting.whatsapp}`} target="_blank" rel="noopener"><Headphones size={16} /> CHAT ADMIN</a></div>
      <div className="alert alert-info"><Info size={17} /><span>Simpan kode order dan bukti pembayaran. Klaim ditinjau langsung oleh admin, bukan otomatis oleh sistem.</span></div>
      <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow">KLAIM SAYA</span><h2>Riwayat Garansi</h2></div></div>
        {claims.length ? <div className="data-list">{claims.map((claim) => <Link href={`/orders/${claim.order.code}`} className="data-row" key={claim.id}><div className="data-row-main"><strong>{claim.code} • {claim.order.productName}</strong><small>{claim.description}</small><small>{formatDate(claim.createdAt)}{claim.adminResponse ? ` • Admin: ${claim.adminResponse}` : ''}</small></div><StatusBadge status={claim.status} /></Link>)}</div> : <div className="empty-state"><ShieldCheck size={28} /><div>Belum ada klaim garansi.</div><Link href="/orders" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>BUKA ORDER SAYA</Link></div>}
      </section>
    </div>
  );
}
