import { ShieldCheck, UsersRound, WalletCards } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { updateUserAccessAction } from '@/lib/actions/admin-users';
import { adjustUserBalanceAction } from '@/lib/actions/admin-wallet';
import { formatDate, rupiah } from '@/lib/format';
import { SubmitButton } from '@/components/submit-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Member & Saldo' };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await db.user.findMany({ include: { _count: { select: { orders: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><UsersRound size={12} /> MEMBER MANAGEMENT</span><h1>Member & Saldo</h1><p>Kelola akses dan penyesuaian saldo dengan audit log.</p></div></div>
      <div className="alert alert-info"><ShieldCheck size={17} /><span>Penyesuaian saldo harus disertai alasan. Nilai negatif memotong saldo dan tidak boleh membuat saldo minus.</span></div>
      <div>{users.map((user) => (
        <article className="admin-card" key={user.id}>
          <div className="admin-card-head"><div><div className="cluster"><span className={`badge ${user.role === 'ADMIN' ? 'badge-red' : 'badge-cyan'}`}>{user.role}</span><span className={`badge ${user.active ? 'badge-green' : 'badge-red'}`}>{user.active ? 'AKTIF' : 'NONAKTIF'}</span></div><h3 style={{ marginTop: 8 }}>{user.name} • @{user.username}</h3><p>{user.email || 'Tanpa email'} • {user.whatsapp || 'Tanpa WA'} • Join {formatDate(user.createdAt, false)} • {user._count.orders} order</p></div><strong className="display text-cyan">{rupiah(user.balance)}</strong></div>
          <div className="detail-grid">
            <form action={updateUserAccessAction} className="stack admin-form panel-pad">
              <input type="hidden" name="userId" value={user.id} />
              <div className="field"><label>Role</label><select name="role" defaultValue={user.role} disabled={user.id === admin.id}><option value="MEMBER">MEMBER</option><option value="ADMIN">ADMIN</option></select>{user.id === admin.id ? <input type="hidden" name="role" value="ADMIN" /> : null}</div>
              <label className="checkbox"><input type="checkbox" name="active" defaultChecked={user.active} disabled={user.id === admin.id} /> Akun aktif{user.id === admin.id ? <input type="hidden" name="active" value="on" /> : null}</label>
              <SubmitButton className="btn btn-secondary btn-sm">SIMPAN AKSES</SubmitButton>
            </form>
            <form action={adjustUserBalanceAction} className="stack admin-form panel-pad">
              <input type="hidden" name="userId" value={user.id} />
              <div className="field"><label><WalletCards size={12} /> Penyesuaian Saldo</label><input name="amount" type="number" min="-10000000" max="10000000" step="1000" required placeholder="50000 atau -10000" /></div>
              <div className="field"><label>Alasan</label><input name="description" required minLength={4} placeholder="Koreksi top-up / kompensasi / refund manual" /></div>
              <SubmitButton className="btn btn-primary btn-sm">SESUAIKAN SALDO</SubmitButton>
            </form>
          </div>
        </article>
      ))}</div>
    </div>
  );
}
