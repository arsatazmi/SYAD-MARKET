'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { loginAction, registerAction } from '@/lib/actions/auth';
import type { ActionState } from '@/lib/types';
import { SubmitButton } from './submit-button';
import { StateMessage } from './state-message';

export function AuthForm({ mode, next = '' }: { mode: 'login' | 'register'; next?: string }) {
  const action = mode === 'login' ? loginAction : registerAction;
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  const isLogin = mode === 'login';

  return (
    <form action={formAction} className="stack">
      {!isLogin ? (
        <>
          <div className="field"><label htmlFor="name">Nama Lengkap</label><input id="name" name="name" required minLength={3} autoComplete="name" placeholder="Nama kamu" /></div>
          <div className="field"><label htmlFor="username">Username Permanen</label><input id="username" name="username" required pattern="[a-z0-9_]{4,20}" autoComplete="username" placeholder="username_123" /><small>4–20 karakter: huruf kecil, angka, underscore.</small></div>
        </>
      ) : null}
      <div className="field">
        <label htmlFor={isLogin ? 'identifier' : 'email'}>{isLogin ? 'Username atau Email' : 'Email (Opsional)'}</label>
        <input id={isLogin ? 'identifier' : 'email'} name={isLogin ? 'identifier' : 'email'} type={isLogin ? 'text' : 'email'} required={isLogin} autoComplete={isLogin ? 'username' : 'email'} placeholder={isLogin ? 'username / email' : 'nama@gmail.com'} />
      </div>
      {!isLogin ? <div className="field"><label htmlFor="whatsapp">Nomor WhatsApp</label><input id="whatsapp" name="whatsapp" required inputMode="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" /></div> : null}
      <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" required minLength={isLogin ? 1 : 8} autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder="Minimal 8 karakter" /></div>
      <input type="hidden" name="next" value={next} />
      <StateMessage state={state} />
      <SubmitButton className="btn btn-primary btn-lg btn-block">
        {isLogin ? <LogIn size={17} /> : <UserPlus size={17} />}
        {isLogin ? 'MASUK AKUN' : 'DAFTAR SEKARANG'}
      </SubmitButton>
      <p className="muted" style={{ textAlign: 'center', fontSize: 11 }}>
        {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
        <Link className="text-cyan" href={isLogin ? '/register' : '/login'}>{isLogin ? 'Daftar member' : 'Login di sini'}</Link>
      </p>
    </form>
  );
}
