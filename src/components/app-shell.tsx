'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Boxes, CircleDollarSign, Code2, FileClock, LayoutDashboard, LogOut, MessageSquareText, PackageOpen, Settings2, ShieldCheck, ShoppingBag, Store, TrendingUp, UserRound, UsersRound, WalletCards } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';

type ShellUser = { name: string; username: string; role: string };

const memberLinks = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/orders', 'Order Saya', ShoppingBag],
  ['/wallet', 'Saldo & Top-up', WalletCards],
  ['/support', 'Garansi & Support', ShieldCheck],
  ['/notifications', 'Kotak Masuk', Bell],
  ['/account', 'Akun Saya', UserRound],
] as const;

const adminLinks = [
  ['/admin', 'Dashboard', LayoutDashboard],
  ['/admin/orders', 'Semua Order', FileClock],
  ['/admin/products', 'Produk & Kategori', Boxes],
  ['/admin/users', 'Member & Saldo', UsersRound],
  ['/admin/wallet', 'Top-up & Refund', CircleDollarSign],
  ['/admin/content', 'Konten Toko', Settings2],
  ['/admin/support', 'Garansi & Ulasan', MessageSquareText],
  ['/admin/api', 'Integrasi API', Code2],
] as const;

export function AppShell({ children, user, variant, unreadCount }: {
  children: React.ReactNode;
  user: ShellUser;
  variant: 'member' | 'admin';
  unreadCount: number;
}) {
  const pathname = usePathname();
  const isAdmin = variant === 'admin';
  const links = isAdmin ? adminLinks : memberLinks;
  const mobileLinks = isAdmin ? adminLinks : [memberLinks[0], memberLinks[1], memberLinks[2], memberLinks[5]];

  const isActive = (href: string) => href === '/admin' || href === '/dashboard'
    ? pathname === href
    : pathname.startsWith(href);

  return (
    <div className={`app-shell ${isAdmin ? 'admin-shell' : ''}`}>
      <aside className="sidebar">
        <Link className="sidebar-brand" href={isAdmin ? '/admin' : '/dashboard'}>
          <img src="/assets/logo.jpg" alt="SYAD MARKET" width={80} height={80} />
          <span>SYAD <b>{isAdmin ? 'ADMIN' : 'MARKET'}</b></span>
        </Link>
        <div className="sidebar-label">{isAdmin ? 'MANAGEMENT' : 'MEMBER AREA'}</div>
        <nav className="sidebar-nav">
          {links.map(([href, label, Icon]) => (
            <Link key={href} href={href} className={`sidebar-link ${isActive(href) ? 'active' : ''}`}>
              <Icon size={18} /><span>{label}</span>
              {href === '/notifications' && unreadCount > 0 ? <span className="count">{unreadCount}</span> : null}
            </Link>
          ))}
          {!isAdmin ? (
            <Link href="/smm" className="sidebar-link"><TrendingUp size={18} /><span>SMM Panel</span></Link>
          ) : null}
        </nav>
        <div className="sidebar-label">LAINNYA</div>
        <nav className="sidebar-nav">
          <Link href="/" className="sidebar-link"><Store size={18} /><span>Lihat Etalase</span></Link>
          {isAdmin ? <Link href="/dashboard" className="sidebar-link"><UserRound size={18} /><span>Mode Member</span></Link> : null}
          {user.role === 'ADMIN' && !isAdmin ? <Link href="/admin" className="sidebar-link"><ShieldCheck size={18} /><span>Admin Page</span></Link> : null}
        </nav>
        <div className="sidebar-bottom">
          <form action={logoutAction}>
            <button className="sidebar-link btn-block" type="submit"><LogOut size={18} /><span>Keluar Akun</span></button>
          </form>
        </div>
      </aside>
      <main className="app-main">
        <header className="app-topbar">
          <div className="topbar-user">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div><strong>{user.name}</strong><span>@{user.username} • {user.role}</span></div>
          </div>
          <div className="cluster">
            <span className={`badge ${isAdmin ? 'badge-red' : 'badge-cyan'}`}><span className="status-dot" />{isAdmin ? 'ADMIN MODE' : 'MANUAL SYSTEM'}</span>
            <Link href="/notifications" className="icon-button" aria-label={`${unreadCount} notifikasi belum dibaca`}><Bell size={17} /></Link>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </main>
      <nav className={`mobile-nav ${isAdmin ? 'admin-mobile-nav' : ''}`} aria-label="Navigasi aplikasi">
        {mobileLinks.map(([href, label, Icon]) => (
          <Link key={href} href={href} className={isActive(href) ? 'active' : ''}>
            <Icon size={18} /><span>{label.split(' ')[0]}</span>
          </Link>
        ))}
        {!isAdmin ? <Link href="/smm"><TrendingUp size={18} /><span>SMM</span></Link> : null}
      </nav>
    </div>
  );
}
