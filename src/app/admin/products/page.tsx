import type { Category, Product } from '@prisma/client';
import { Boxes, PackagePlus, PlusCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { saveCategoryAction, saveProductAction } from '@/lib/actions/admin-products';
import { rupiah } from '@/lib/format';
import { SubmitButton } from '@/components/submit-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Produk & Kategori' };

function ProductEditor({ categories, product }: { categories: Category[]; product?: Product }) {
  return (
    <form action={saveProductAction} className="stack" style={{ marginTop: 16 }}>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="form-grid">
        <div className="field"><label>Nama Produk</label><input name="name" defaultValue={product?.name || ''} required /></div>
        <div className="field"><label>Kategori</label><select name="categoryId" defaultValue={product?.categoryId || categories[0]?.id} required>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></div>
        <div className="field"><label>Slug</label><input name="slug" defaultValue={product?.slug || ''} placeholder="otomatis-dari-nama" required={Boolean(product)} /></div>
        <div className="field"><label>Jenis</label><select name="kind" defaultValue={product?.kind || 'STANDARD'}><option value="STANDARD">STANDARD</option><option value="SMM">SMM — harga per 1.000</option></select></div>
        <div className="field field-full"><label>Deskripsi</label><textarea name="description" defaultValue={product?.description || ''} required /></div>
        <div className="field"><label>Label Harga</label><input name="priceLabel" defaultValue={product?.priceLabel || 'CHAT ADMIN'} required /><small>Bisa tetap memakai format lama seperti 3-80𝙆.</small></div>
        <div className="field"><label>Harga Numerik</label><input name="price" type="number" min="0" defaultValue={product?.price || 0} required /><small>Isi 0 jika perlu penawaran. SMM: tarif per 1.000.</small></div>
        <div className="field"><label>Minimal Jumlah</label><input name="minQuantity" type="number" min="1" defaultValue={product?.minQuantity || 1} required /></div>
        <div className="field"><label>Maksimal Jumlah</label><input name="maxQuantity" type="number" min="1" defaultValue={product?.maxQuantity || 1} required /></div>
        <div className="field"><label>Stok (Kosong = Tidak Terbatas)</label><input name="stock" type="number" min="0" defaultValue={product?.stock ?? ''} /></div>
        <div className="field"><label>Estimasi Pengerjaan</label><input name="estimate" defaultValue={product?.estimate || ''} placeholder="Contoh: 1–24 jam setelah verifikasi" /></div>
        <div className="field"><label>Garansi / Refill</label><input name="guarantee" defaultValue={product?.guarantee || ''} placeholder="Contoh: refill 30 hari / konfirmasi admin" /></div>
        <div className="field"><label>Provider Name (API Nanti)</label><input name="providerName" defaultValue={product?.providerName || ''} placeholder="Kosongkan selama manual" /></div>
        <div className="field"><label>Provider Service ID (API Nanti)</label><input name="providerServiceId" defaultValue={product?.providerServiceId || ''} placeholder="Kosongkan selama manual" /></div>
        <div className="field field-full"><label>Instruksi Order</label><textarea name="instructions" defaultValue={product?.instructions || ''} placeholder="Instruksi link, target, atau data yang harus disiapkan member..." /></div>
      </div>
      <div className="cluster">
        <label className="checkbox"><input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Aktif</label>
        <label className="checkbox"><input type="checkbox" name="requiresQuote" defaultChecked={product?.requiresQuote ?? true} /> Perlu penawaran admin</label>
        <label className="checkbox"><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Unggulan</label>
        <span className="badge badge-yellow">FULFILMENT: MANUAL</span>
      </div>
      <SubmitButton className="btn btn-primary">{product ? 'SIMPAN PRODUK' : 'TAMBAH PRODUK'}</SubmitButton>
    </form>
  );
}

export default async function AdminProductsPage() {
  await requireAdmin();
  const categories = await db.category.findMany({ orderBy: { sortOrder: 'asc' }, include: { products: { orderBy: { createdAt: 'asc' } } } });
  const productCount = categories.reduce((sum, category) => sum + category.products.length, 0);
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="section-heading" style={{ marginBottom: 0 }}><div><span className="eyebrow"><Boxes size={12} /> CATALOG MANAGEMENT</span><h1>Produk & Kategori</h1><p>{categories.length} kategori • {productCount} layanan • semua manual.</p></div></div>

      <details className="admin-card">
        <summary className="cluster"><PlusCircle size={17} className="text-cyan" /><strong>Tambah Kategori</strong></summary>
        <form action={saveCategoryAction} className="form-grid" style={{ marginTop: 16 }}>
          <div className="field"><label>Nama Kategori</label><input name="name" required placeholder="NAMA KATEGORI" /></div>
          <div className="field"><label>Slug (Opsional)</label><input name="slug" placeholder="otomatis" /></div>
          <div className="field field-full"><label>Deskripsi</label><textarea name="description" required /></div>
          <div className="field"><label>Icon</label><select name="icon" defaultValue="package">{['package', 'trending-up', 'crown', 'server', 'bot', 'cloud', 'message-square', 'code-2', 'sparkles'].map((icon) => <option key={icon}>{icon}</option>)}</select></div>
          <div className="field"><label>Urutan</label><input name="sortOrder" type="number" defaultValue="10" required /></div>
          <label className="checkbox"><input type="checkbox" name="active" defaultChecked /> Aktif</label>
          <SubmitButton className="btn btn-primary">SIMPAN KATEGORI</SubmitButton>
        </form>
      </details>

      <details className="admin-card">
        <summary className="cluster"><PackagePlus size={17} className="text-green" /><strong>Tambah Produk / Layanan</strong></summary>
        <ProductEditor categories={categories} />
      </details>

      {categories.map((category) => (
        <section className="panel panel-pad" key={category.id}>
          <div className="section-heading"><div><span className="eyebrow">{category.slug}</span><h2>{category.name}</h2><p>{category.description}</p></div><span className={`badge ${category.active ? 'badge-green' : 'badge-red'}`}>{category.active ? 'AKTIF' : 'NONAKTIF'} • {category.products.length}</span></div>
          {category.products.map((product) => (
            <details className="admin-card" key={product.id}>
              <summary>
                <div className="cluster"><span className={`badge ${product.active ? 'badge-green' : 'badge-red'}`}>{product.active ? 'AKTIF' : 'OFF'}</span><span className="badge">{product.kind}</span><strong>{product.name}</strong></div>
                <p>{product.priceLabel}{!product.requiresQuote && product.price ? ` • ${rupiah(product.price)}` : ' • Perlu quote'}</p>
              </summary>
              <ProductEditor categories={categories} product={product} />
            </details>
          ))}
        </section>
      ))}
    </div>
  );
}
