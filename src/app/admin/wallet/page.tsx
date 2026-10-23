import { CheckCircle2, CircleDollarSign, XCircle } from 'lucide-react';
import type { Prisma, WalletRequestStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { reviewWalletRequestAction } from '@/lib/actions/admin-wallet';
import { formatDate, rupiah } from '@/lib/format';
import { StatusBadge } from '@/components/status-badge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Top-up & Refund' };

export default async function AdminWalletPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status = 'PENDING' } = await searchParams;
  const where: Prisma.WalletRequestWhereInput = status ? { status: status as WalletRequestStatus } : {};
  const requests = await db.walletRequest.findMany({ where, include: { user: { select: { username: true, name: true, balance: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><CircleDollarSign size={12} /> MANUAL FINANCE</span><h1>Top-up & Refund</h1><p>Periksa bukti di WhatsApp sebelum menyetujui permintaan.</p></div></div>
      <div className="filter-bar cluster">{[['PENDING', 'Menunggu'], ['APPROVED', 'Disetujui'], ['REJECTED', 'Ditolak'], ['', 'Semua']].map(([value, label]) => <a key={value} className={`btn btn-sm ${status === value ? 'btn-primary' : 'btn-ghost'}`} href={value ? `/admin/wallet?status=${value}` : '/admin/wallet?status='}>{label}</a>)}</div>
      <div>{requests.map((request) => (
        <article className="admin-card" key={request.id}>
          <div className="admin-card-head"><div><div className="cluster"><StatusBadge status={request.type} /><StatusBadge status={request.status} /></div><h3 style={{ marginTop: 8 }}>{request.code} • {rupiah(request.amount)}</h3><p>@{request.user.username} • {request.user.name} • Saldo saat ini {rupiah(request.user.balance)} • {formatDate(request.createdAt)}</p></div><a className="btn btn-ghost btn-sm" href={`https://wa.me/${request.whatsapp}`} target="_blank" rel="noopener">BUKA WHATSAPP</a></div>
          <div className="detail-list"><div className="detail-item"><span>WhatsApp</span><strong>{request.whatsapp}</strong></div><div className="detail-item"><span>Catatan / Tujuan</span><strong>{request.note || 'Tidak ada catatan'}</strong></div>{request.adminNote ? <div className="detail-item"><span>Catatan Admin</span><strong>{request.adminNote}</strong></div> : null}</div>
          {request.status === 'PENDING' ? <form action={reviewWalletRequestAction} className="stack" style={{ marginTop: 14 }}><input type="hidden" name="requestId" value={request.id} /><div className="field"><label>Catatan Review</label><input name="adminNote" placeholder="Bukti valid / alasan ditolak / detail refund" /></div><div className="cluster"><button className="btn btn-success" type="submit" name="decision" value="APPROVE"><CheckCircle2 size={15} /> {request.type === 'TOPUP' ? 'SETUJUI & TAMBAH SALDO' : 'TANDAI REFUND SELESAI'}</button><button className="btn btn-danger" type="submit" name="decision" value="REJECT"><XCircle size={15} /> TOLAK{request.type === 'REFUND' ? ' & KEMBALIKAN DANA' : ''}</button></div></form> : null}
        </article>
      ))}</div>
      {!requests.length ? <div className="empty-state">Tidak ada permintaan pada filter ini.</div> : null}
    </div>
  );
}
