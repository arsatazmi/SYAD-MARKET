import { MessageSquareText, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { moderateReviewAction, updateWarrantyClaimAction } from '@/lib/actions/admin-support';
import { formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/status-badge';
import { SubmitButton } from '@/components/submit-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Garansi & Ulasan' };

export default async function AdminSupportPage() {
  await requireAdmin();
  const [claims, reviews] = await Promise.all([
    db.warrantyClaim.findMany({ include: { user: { select: { username: true } }, order: { select: { code: true, productName: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    db.review.findMany({ include: { user: { select: { username: true } }, order: { select: { code: true, productName: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
  ]);
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><ShieldCheck size={12} /> SUPPORT MANAGEMENT</span><h1>Garansi & Ulasan</h1><p>Tinjau klaim dan moderasi testimoni yang tampil di etalase.</p></div></div>
      <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow">GARANSI</span><h2>Klaim Member</h2></div></div>
        {claims.map((claim) => <article className="admin-card" key={claim.id}><div className="admin-card-head"><div><div className="cluster"><span className="code">{claim.code}</span><StatusBadge status={claim.status} /></div><h3 style={{ marginTop: 8 }}>{claim.order.productName}</h3><p>{claim.order.code} • @{claim.user.username} • {formatDate(claim.createdAt)}</p></div></div><p>{claim.description}</p><form action={updateWarrantyClaimAction} className="form-grid"><input type="hidden" name="claimId" value={claim.id} /><div className="field"><label>Status</label><select name="status" defaultValue={claim.status}>{['OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED'].map((status) => <option key={status}>{status}</option>)}</select></div><div className="field"><label>Respons Admin</label><input name="adminResponse" defaultValue={claim.adminResponse || ''} /></div><div className="field field-full"><SubmitButton className="btn btn-primary btn-sm">SIMPAN RESPONS</SubmitButton></div></form></article>)}
        {!claims.length ? <div className="empty-state">Belum ada klaim garansi.</div> : null}
      </section>
      <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow"><MessageSquareText size={12} /> MODERASI</span><h2>Ulasan Pembeli</h2></div></div>
        {reviews.map((review) => <div className="data-row" key={review.id}><div className="data-row-main"><div className="review-stars">{'★'.repeat(review.rating)}</div><strong>{review.comment}</strong><small>@{review.user.username} • {review.order?.productName || 'Order terhapus'} • {formatDate(review.createdAt)}</small></div><form action={moderateReviewAction} className="cluster"><input type="hidden" name="reviewId" value={review.id} /><span className={`badge ${review.approved ? 'badge-green' : 'badge-yellow'}`}>{review.approved ? 'TAMPIL' : 'MENUNGGU'}</span><button className="btn btn-ghost btn-sm" name="approved" value={review.approved ? 'false' : 'true'} type="submit">{review.approved ? 'SEMBUNYIKAN' : 'TAMPILKAN'}</button></form></div>)}
        {!reviews.length ? <div className="empty-state">Belum ada ulasan.</div> : null}
      </section>
    </div>
  );
}
