import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const unreadCount = await db.notification.count({ where: { userId: user.id, isRead: false } });
  return <AppShell user={user} variant="admin" unreadCount={unreadCount}>{children}</AppShell>;
}
