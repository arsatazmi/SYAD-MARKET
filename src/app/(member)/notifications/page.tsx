import { Bell, CheckCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { markNotificationsReadAction } from '@/lib/actions/support';
import { formatDate } from '@/lib/format';
import { SubmitButton } from '@/components/submit-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kotak Masuk' };

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 100 });
  const unread = notifications.filter((item) => !item.isRead).length;
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><Bell size={12} /> KOTAK MASUK</span><h1>Notifikasi</h1><p>{unread} pesan belum dibaca.</p></div>{unread ? <form action={markNotificationsReadAction}><SubmitButton className="btn btn-ghost"><CheckCheck size={16} /> TANDAI SUDAH DIBACA</SubmitButton></form> : null}</div>
      <section className="panel panel-pad">{notifications.length ? <div className="data-list">{notifications.map((item) => <div className={`data-row ${item.isRead ? '' : 'notification-unread'}`} key={item.id}><div className="data-row-main"><strong>{item.title}</strong><small>{item.message}</small><small>{formatDate(item.createdAt)}</small></div>{!item.isRead ? <span className="badge badge-cyan">BARU</span> : null}</div>)}</div> : <div className="empty-state"><Bell size={28} /><div>Kotak masuk masih kosong.</div></div>}</section>
    </div>
  );
}
