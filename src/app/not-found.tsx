import Link from 'next/link';
import { PackageSearch } from 'lucide-react';

export default function NotFound() {
  return <main className="auth-page"><section className="neon-panel auth-card" style={{ textAlign: 'center' }}><PackageSearch size={40} className="text-cyan" /><h1>Halaman tidak ditemukan</h1><p className="muted">Data mungkin sudah berubah atau kamu tidak mempunyai akses.</p><Link href="/" className="btn btn-primary">KEMBALI KE BERANDA</Link></section></main>;
}
