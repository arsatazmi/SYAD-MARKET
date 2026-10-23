import { BellRing, ImagePlus, Save, Settings2 } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getStoreSetting } from '@/lib/data';
import { createAnnouncementAction, saveBannerAction, saveStoreSettingsAction } from '@/lib/actions/admin-content';
import { toggleAnnouncementAction } from '@/lib/actions/admin-announcements';
import { formatDate } from '@/lib/format';
import { SubmitButton } from '@/components/submit-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Konten Toko' };

export default async function AdminContentPage() {
  await requireAdmin();
  const [setting, banners, announcements] = await Promise.all([
    getStoreSetting(),
    db.banner.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.announcement.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
  ]);
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><Settings2 size={12} /> STORE CONTENT</span><h1>Konten Toko</h1><p>Atur identitas, QRIS, banner, dan pengumuman tanpa mengubah kode.</p></div></div>
      <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow"><Save size={12} /> PENGATURAN</span><h2>Identitas & Pembayaran</h2></div></div>
        <form action={saveStoreSettingsAction} className="form-grid">
          <div className="field"><label>Nama Toko</label><input name="storeName" defaultValue={setting.storeName} required /></div>
          <div className="field"><label>WhatsApp Admin</label><input name="whatsapp" defaultValue={setting.whatsapp} required /></div>
          <div className="field field-full"><label>Tagline</label><input name="tagline" defaultValue={setting.tagline} required /></div>
          <div className="field field-full"><label>Path QRIS Lokal</label><input name="qrisPath" defaultValue={setting.qrisPath} required /><small>Gunakan path lokal seperti /assets/qris.jpg.</small></div>
          <div className="field field-full"><label>Pengumuman Singkat</label><textarea name="announcement" defaultValue={setting.announcement} required /></div>
          <div className="field field-full"><SubmitButton className="btn btn-primary">SIMPAN PENGATURAN</SubmitButton></div>
        </form>
      </section>

      <div className="detail-grid">
        <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow"><ImagePlus size={12} /> BANNER</span><h2>Tambah Banner</h2></div></div>
          <form action={saveBannerAction} className="stack">
            <div className="field"><label>Judul</label><input name="title" required /></div>
            <div className="field"><label>Subjudul</label><input name="subtitle" /></div>
            <div className="field"><label>Path / URL Gambar</label><input name="imagePath" required placeholder="/assets/banner.webp" /></div>
            <div className="field"><label>Urutan</label><input name="sortOrder" type="number" defaultValue={banners.length + 1} /></div>
            <label className="checkbox"><input type="checkbox" name="active" defaultChecked /> Aktif</label>
            <SubmitButton className="btn btn-primary">TAMBAH BANNER</SubmitButton>
          </form>
        </section>
        <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow"><BellRing size={12} /> PENGUMUMAN</span><h2>Buat Pengumuman</h2></div></div>
          <form action={createAnnouncementAction} className="stack">
            <div className="field"><label>Judul</label><input name="title" required /></div>
            <div className="field"><label>Isi Pengumuman</label><textarea name="message" required /></div>
            <label className="checkbox"><input type="checkbox" name="sendInbox" defaultChecked /> Kirim juga ke inbox seluruh member aktif</label>
            <SubmitButton className="btn btn-primary">PUBLIKASIKAN</SubmitButton>
          </form>
        </section>
      </div>

      <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow">BANNER AKTIF</span><h2>Daftar Banner</h2></div></div>
        {banners.map((banner) => <details className="admin-card" key={banner.id}><summary><strong>{banner.sortOrder}. {banner.title}</strong><p>{banner.imagePath} • {banner.active ? 'Aktif' : 'Nonaktif'}</p></summary><form action={saveBannerAction} className="form-grid" style={{ marginTop: 15 }}><input type="hidden" name="id" value={banner.id} /><div className="field"><label>Judul</label><input name="title" defaultValue={banner.title} required /></div><div className="field"><label>Subjudul</label><input name="subtitle" defaultValue={banner.subtitle || ''} /></div><div className="field field-full"><label>Gambar</label><input name="imagePath" defaultValue={banner.imagePath} required /></div><div className="field"><label>Urutan</label><input name="sortOrder" type="number" defaultValue={banner.sortOrder} /></div><label className="checkbox"><input type="checkbox" name="active" defaultChecked={banner.active} /> Aktif</label><div className="field field-full"><SubmitButton className="btn btn-secondary btn-sm">SIMPAN BANNER</SubmitButton></div></form></details>)}
      </section>

      <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow">RIWAYAT</span><h2>Pengumuman</h2></div></div>
        <div className="data-list">{announcements.map((item) => <div className="data-row" key={item.id}><div className="data-row-main"><strong>{item.title}</strong><small>{item.message}</small><small>{formatDate(item.createdAt)}</small></div><form action={toggleAnnouncementAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="active" value={item.active ? 'false' : 'true'} /><SubmitButton className={`btn btn-sm ${item.active ? 'btn-danger' : 'btn-success'}`}>{item.active ? 'SEMBUNYIKAN' : 'AKTIFKAN'}</SubmitButton></form></div>)}</div>
      </section>
    </div>
  );
}
