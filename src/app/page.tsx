import Link from 'next/link';
import { BellRing, CheckCircle2, Clock3, Headphones, Info, PackageCheck, RefreshCw, ShieldCheck, ShoppingBag, Sparkles, UsersRound, WalletCards } from 'lucide-react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getPublicCatalog, getStoreSetting } from '@/lib/data';
import { rupiah } from '@/lib/format';
import { PublicHeader } from '@/components/public-header';
import { BannerSlider } from '@/components/banner-slider';
import { Storefront } from '@/components/storefront';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [setting, categories, user, banners, memberCount, successCount, serviceCount, reviews, announcements] = await Promise.all([
    getStoreSetting(),
    getPublicCatalog(),
    getCurrentUser(),
    db.banner.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
    db.user.count({ where: { role: 'MEMBER', active: true } }),
    db.order.count({ where: { status: 'COMPLETED' } }),
    db.product.count({ where: { active: true } }),
    db.review.findMany({ where: { approved: true }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 6 }),
    db.announcement.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, take: 2 }),
  ]);

  return (
    <>
      <PublicHeader user={user} storeName={setting.storeName} logoPath={setting.logoPath} />
      <main className="public-main" id="home">
        <div className="container">
          <section className="hero-profile">
            <img className="hero-logo" src={setting.logoPath} alt={setting.storeName} width={800} height={799} />
            <h1>TOKO DIGITAL <span className="text-cyan">SYAD</span></h1>
            <p>MARKET DIGITAL TERPERCAYA • SISTEM MANUAL AMAN</p>
          </section>

          <div className="hero-grid">
            <div className="neon-panel balance-card">
              <div><small>Saldo Website</small><strong>{user ? rupiah(user.balance) : 'Rp 0'}</strong></div>
              <div className="balance-actions">
                <Link className="icon-button" href={user ? '/dashboard' : '/login'} aria-label="Dashboard"><RefreshCw size={18} /></Link>
                <Link className="btn btn-primary" href={user ? '/wallet' : '/login'}><WalletCards size={17} /> {user ? 'Isi Saldo' : 'Login Member'}</Link>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-item"><UsersRound size={19} /><strong>{memberCount}</strong><span>Member Shop</span></div>
              <div className="stat-item"><CheckCircle2 size={19} /><strong>{successCount}</strong><span>Transaksi Sukses</span></div>
              <div className="stat-item"><ShoppingBag size={19} /><strong>{serviceCount}</strong><span>Layanan Aktif</span></div>
              <div className="stat-item"><Clock3 size={19} /><strong>24/7</strong><span>Support Manual</span></div>
            </div>
          </div>

          <div className="announcement-bar"><BellRing size={17} /><span>{announcements[0]?.message || setting.announcement}</span></div>
          <BannerSlider banners={banners} />

          <section className="section" id="layanan">
            <div className="section-heading">
              <div><span className="eyebrow"><Sparkles size={12} /> KATALOG DIGITAL</span><h2>Layanan Digital</h2><p>Pilih kategori, isi data, lalu admin memproses order secara manual.</p></div>
              <Link href="/smm" className="btn btn-ghost btn-sm">BUKA SMM PANEL</Link>
            </div>
            <Storefront categories={categories} user={user} />
          </section>

          <section className="section" id="cara-order">
            <div className="section-heading"><div><span className="eyebrow">PANDUAN</span><h2>Order Cepat & Mudah</h2><p>Alur jelas tanpa menganggap pembayaran terdeteksi otomatis.</p></div></div>
            <div className="steps-grid">
              <article className="panel step-card"><span className="step-number">01</span><h3>Login & Pilih Layanan</h3><p>Daftar akun, pilih kategori dan layanan, lalu isi data target atau detail paket.</p></article>
              <article className="panel step-card"><span className="step-number">02</span><h3>Bayar Manual</h3><p>Gunakan QRIS dan konfirmasi WhatsApp, atau bayar dengan saldo yang sudah disetujui admin.</p></article>
              <article className="panel step-card"><span className="step-number">03</span><h3>Admin Proses</h3><p>Admin verifikasi dan mengirim hasil. Status serta data pembelian tersimpan di akun.</p></article>
            </div>
          </section>

          <section className="section" id="testimoni">
            <div className="section-heading"><div><span className="eyebrow">TESTIMONI</span><h2>Ulasan Pembeli</h2><p>Ulasan ditampilkan setelah moderasi admin.</p></div></div>
            {reviews.length ? (
              <div className="review-grid">
                {reviews.map((review) => (
                  <article className="panel review-card" key={review.id}>
                    <div className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                    <p>“{review.comment}”</p>
                    <div className="review-author"><span className="avatar">{review.user.name.charAt(0)}</span><span>{review.user.name}<br />Member terverifikasi</span></div>
                  </article>
                ))}
              </div>
            ) : <div className="empty-state"><MessageSquareTextIcon /><div>Belum ada ulasan yang ditampilkan. Jadilah pembeli pertama yang memberi ulasan.</div></div>}
          </section>

          <section className="section">
            <div className="section-heading"><div><span className="eyebrow">INFORMASI</span><h2>Pertanyaan Umum</h2></div></div>
            <div className="faq-list">
              <details><summary>Apakah pembayaran terdeteksi otomatis?</summary><p>Tidak. Scan QRIS seperti sistem lama, lalu kirim bukti ke WhatsApp admin. Status berubah setelah admin memverifikasi.</p></details>
              <details><summary>Bagaimana produk dengan harga CHAT ADMIN atau rentang harga?</summary><p>Buat order dan tulis detail paket. Admin menetapkan harga di dashboard, kemudian kamu mendapat notifikasi untuk membayar.</p></details>
              <details><summary>Apakah SMM Panel langsung diproses provider?</summary><p>Belum. Semua layanan SMM masih dikerjakan manual oleh admin. Struktur integrasi API sudah disiapkan untuk pengembangan berikutnya.</p></details>
              <details><summary>Di mana melihat hasil pesanan?</summary><p>Login dan buka Order Saya. Jika admin sudah menyelesaikan pesanan, data hasil tersedia di halaman detail order.</p></details>
            </div>
          </section>

          <section className="section neon-panel panel-pad">
            <div className="cluster" style={{ justifyContent: 'space-between' }}>
              <div><span className="eyebrow"><Headphones size={12} /> BUTUH BANTUAN?</span><h2 className="display" style={{ margin: 0 }}>Admin siap membantu</h2><p className="muted">Konfirmasi pembayaran dan konsultasi produk melalui WhatsApp resmi.</p></div>
              <a className="btn btn-primary" href={`https://wa.me/${setting.whatsapp}`} target="_blank" rel="noopener">CHAT WHATSAPP</a>
            </div>
          </section>
        </div>
        <footer className="public-footer">© 2026 SYAD MARKET • Full manual marketplace • API-ready</footer>
      </main>
    </>
  );
}

function MessageSquareTextIcon() {
  return <Info size={28} />;
}
