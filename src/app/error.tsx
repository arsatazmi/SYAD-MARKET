'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="auth-page"><section className="neon-panel auth-card" style={{ textAlign: 'center' }}><AlertTriangle size={40} className="text-red" /><h1>Terjadi kendala</h1><p className="muted">Permintaan tidak dapat diproses. Silakan coba lagi atau hubungi admin jika kendala berulang.</p>{error.digest ? <small className="muted">Kode referensi: {error.digest}</small> : null}<div className="cluster" style={{ justifyContent: 'center' }}><button className="btn btn-primary" onClick={reset}>COBA LAGI</button><Link href="/" className="btn btn-ghost">BERANDA</Link></div></section></main>;
}
