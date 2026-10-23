import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unreadCount = await db.notification.count({ where: { userId: user.id, isRead: false } });
  return <AppShell user={user} variant="member" unreadCount={unreadCount}>{children}</AppShell>;
}
