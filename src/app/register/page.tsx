import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { AuthForm } from '@/components/auth-form';

export const metadata = { title: 'Daftar Member' };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');
  return (
    <main className="auth-page">
      <Link href="/" className="auth-brand"><img src="/assets/logo.jpg" alt="SYAD MARKET" /><span>SYAD <b>MARKET</b></span></Link>
      <section className="neon-panel auth-card">
        <span className="badge badge-purple"><UserPlus size={12} /> MEMBER BARU</span>
        <h1>Buat akun member</h1><p>Satu akun untuk semua layanan, riwayat, saldo, dan garansi.</p>
        <AuthForm mode="register" />
      </section>
      <Link href="/" className="muted auth-back">← Kembali ke etalase</Link>
    </main>
  );
}
