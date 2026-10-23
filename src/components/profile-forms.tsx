'use client';

import { useActionState } from 'react';
import { KeyRound, Save } from 'lucide-react';
import { changePasswordAction, updateProfileAction } from '@/lib/actions/auth';
import type { ActionState } from '@/lib/types';
import { SubmitButton } from './submit-button';
import { StateMessage } from './state-message';

export function ProfileForms({ user }: { user: { name: string; username: string; email: string | null; whatsapp: string | null } }) {
  const [profileState, profileAction] = useActionState<ActionState, FormData>(updateProfileAction, {});
  const [passwordState, passwordAction] = useActionState<ActionState, FormData>(changePasswordAction, {});

  return (
    <div className="detail-grid">
      <section className="panel panel-pad">
        <span className="eyebrow"><Save size={13} /> PROFIL MEMBER</span><h2 className="display" style={{ marginTop: 0 }}>Pengaturan Akun</h2>
        <form action={profileAction} className="stack">
          <div className="field"><label>Username (Permanen)</label><input value={user.username} disabled /><small>Username tidak dapat diubah.</small></div>
          <div className="field"><label>Nama Lengkap</label><input name="name" defaultValue={user.name} required minLength={3} /></div>
          <div className="field"><label>Email</label><input name="email" type="email" defaultValue={user.email || ''} placeholder="nama@gmail.com" /></div>
          <div className="field"><label>Nomor WhatsApp</label><input name="whatsapp" defaultValue={user.whatsapp || ''} required inputMode="tel" /></div>
          <StateMessage state={profileState} />
          <SubmitButton className="btn btn-primary"><Save size={15} /> SIMPAN PERUBAHAN</SubmitButton>
        </form>
      </section>
      <section className="panel panel-pad">
        <span className="eyebrow"><KeyRound size={13} /> KEAMANAN</span><h2 className="display" style={{ marginTop: 0 }}>Ganti Password</h2>
        <form action={passwordAction} className="stack">
          <div className="field"><label>Password Saat Ini</label><input name="currentPassword" type="password" required autoComplete="current-password" /></div>
          <div className="field"><label>Password Baru</label><input name="newPassword" type="password" required minLength={8} autoComplete="new-password" /><small>Minimal 8 karakter.</small></div>
          <StateMessage state={passwordState} />
          <SubmitButton className="btn btn-secondary"><KeyRound size={15} /> PERBARUI PASSWORD</SubmitButton>
        </form>
      </section>
    </div>
  );
}
