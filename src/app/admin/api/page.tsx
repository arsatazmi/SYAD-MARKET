import { Code2, KeyRound, ShieldCheck, Webhook } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { saveProviderNoteAction } from '@/lib/actions/admin-content';
import { SubmitButton } from '@/components/submit-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Integrasi API' };

export default async function AdminApiPage() {
  await requireAdmin();
  const [providers, mappedProducts] = await Promise.all([
    db.provider.findMany({ orderBy: { name: 'asc' } }),
    db.product.findMany({ where: { OR: [{ providerName: { not: null } }, { providerServiceId: { not: null } }] }, include: { category: true }, orderBy: { name: 'asc' } }),
  ]);
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><Code2 size={12} /> API-READY</span><h1>Integrasi Provider</h1><p>Menyimpan konfigurasi non-rahasia tanpa mengaktifkan otomatisasi.</p></div><span className="badge badge-yellow"><ShieldCheck size={12} /> SEMUA MANUAL</span></div>
      <div className="alert alert-info"><KeyRound size={17} /><div><strong>Secret tidak disimpan di database atau form ini.</strong><br />Saat API siap, simpan key sebagai environment variable Vercel. Kolom API Key Env hanya menyimpan nama variabel, misalnya <span className="code">SMM_API_KEY</span>.</div></div>
      <div className="detail-grid">
        <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow">PROVIDER</span><h2>Catatan Koneksi</h2></div></div><form action={saveProviderNoteAction} className="stack"><div className="field"><label>Nama Provider</label><input name="name" required placeholder="SMM_PROVIDER" /></div><div className="field"><label>Base URL (Opsional)</label><input name="baseUrl" type="url" placeholder="https://api.provider.com" /></div><div className="field"><label>Nama Env API Key</label><input name="apiKeyEnv" placeholder="SMM_API_KEY" /></div><SubmitButton className="btn btn-primary">SIMPAN SEBAGAI MANUAL</SubmitButton></form></section>
        <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow"><Webhook size={12} /> MIGRASI</span><h2>Saat API Sudah Siap</h2></div></div><div className="steps-grid" style={{ gridTemplateColumns: '1fr' }}><div className="step-card" style={{ padding: 12 }}><strong>1. Tambahkan adapter provider</strong><p>Implementasikan fungsi createOrder, checkStatus, dan cancel pada server.</p></div><div className="step-card" style={{ padding: 12 }}><strong>2. Uji satu layanan</strong><p>Petakan Provider Name dan Service ID pada satu produk terlebih dahulu.</p></div><div className="step-card" style={{ padding: 12 }}><strong>3. Aktifkan bertahap</strong><p>Ubah fulfilment produk dari MANUAL ke API setelah webhook dan reconciliasi teruji.</p></div></div></section>
      </div>
      <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow">KONFIGURASI TERSIMPAN</span><h2>Provider</h2></div></div><div className="data-list">{providers.map((provider) => <div className="data-row" key={provider.id}><div className="data-row-main"><strong>{provider.name}</strong><small>{provider.baseUrl || 'Base URL belum diisi'} • Env: {provider.apiKeyEnv || 'belum diisi'}</small></div><span className="badge badge-yellow">MANUAL / DISABLED</span></div>)}</div></section>
      <section className="panel panel-pad"><div className="section-heading"><div><span className="eyebrow">SERVICE MAPPING</span><h2>Produk dengan Provider ID</h2></div></div>{mappedProducts.length ? <div className="data-list">{mappedProducts.map((product) => <div className="data-row" key={product.id}><div className="data-row-main"><strong>{product.name}</strong><small>{product.category.name} • {product.providerName || 'Tanpa provider'} • Service: {product.providerServiceId || 'belum diisi'}</small></div><span className="badge badge-yellow">MANUAL</span></div>)}</div> : <div className="empty-state">Belum ada produk yang dipetakan. Mapping dapat diisi dari halaman Produk & Kategori.</div>}</section>
    </div>
  );
}
