import Link from 'next/link';
import { Bell, Home, LayoutDashboard, LogIn, MessageSquareText, PackageOpen, TrendingUp, UserRound } from 'lucide-react';

export function PublicHeader({ user, storeName, logoPath }: {
  user: { name: string; role: string } | null;
  storeName: string;
  logoPath: string;
}) {
  return (
    <>
      <header className="public-header">
        <div className="container public-header-inner">
          <Link href="/" className="public-brand">
            <img src={logoPath} alt={`Logo ${storeName}`} width={800} height={799} />
            <span>SYAD <b>MARKET</b></span>
          </Link>
          <nav className="public-nav" aria-label="Navigasi toko">
            <a href="/#layanan">Layanan</a>
            <Link href="/smm">SMM Panel</Link>
            <a href="/#cara-order">Cara Order</a>
            <a href="/#testimoni">Testimoni</a>
          </nav>
          <div className="header-actions">
            <Link className="profile-pill" href={user ? '/dashboard' : '/login'}>
              <UserRound size={17} />
              <span>{user ? `Hi, ${user.name.split(' ')[0]}` : 'Hi, Guest'}</span>
            </Link>
            {user ? (
              <Link className="icon-button" href="/notifications" aria-label="Kotak masuk"><Bell size={17} /></Link>
            ) : (
              <Link className="btn btn-primary btn-sm" href="/login"><LogIn size={14} /> LOGIN</Link>
            )}
            {user?.role === 'ADMIN' ? <Link className="icon-button" href="/admin" aria-label="Admin dashboard"><LayoutDashboard size={17} /></Link> : null}
          </div>
        </div>
      </header>
      <nav className="mobile-nav public-mobile-nav" aria-label="Navigasi mobile">
        <a href="/#home"><Home size={18} /><span>Home</span></a>
        <a href="/#layanan"><PackageOpen size={18} /><span>Layanan</span></a>
        <Link href="/smm"><TrendingUp size={18} /><span>SMM</span></Link>
        <a href="/#testimoni"><MessageSquareText size={18} /><span>Testimoni</span></a>
        <Link href={user ? '/account' : '/login'}><UserRound size={18} /><span>Akun</span></Link>
      </nav>
    </>
  );
}
