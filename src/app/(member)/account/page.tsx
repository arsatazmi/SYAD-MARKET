import { UserRound } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { ProfileForms } from '@/components/profile-forms';
import { logoutAction } from '@/lib/actions/auth';
import { SubmitButton } from '@/components/submit-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Akun Saya' };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><UserRound size={12} /> PENGATURAN MEMBER</span><h1>Akun Saya</h1><p>@{user.username} • Bergabung {formatDate(user.createdAt, false)}</p></div><form action={logoutAction}><SubmitButton className="btn btn-danger">KELUAR AKUN</SubmitButton></form></div>
      <ProfileForms user={user} />
    </div>
  );
}
