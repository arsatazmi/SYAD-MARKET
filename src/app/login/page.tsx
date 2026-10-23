import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { AuthForm } from '@/components/auth-form';

export const metadata = { title: 'Login Member' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === 'ADMIN' ? '/admin' : '/dashboard');
  const { next } = await searchParams;
  return (
    <main className="auth-page">
      <Link href="/" className="auth-brand"><img src="/assets/logo.jpg" alt="SYAD MARKET" /><span>SYAD <b>MARKET</b></span></Link>
      <section className="neon-panel auth-card">
        <span className="badge badge-cyan"><ShieldCheck size={12} /> MEMBER AREA</span>
        <h1>Selamat datang</h1><p>Login untuk order, memantau proses, dan mengelola saldo.</p>
        <AuthForm mode="login" next={next || ''} />
      </section>
      <Link href="/" className="muted auth-back">← Kembali ke etalase</Link>
    </main>
  );
}
