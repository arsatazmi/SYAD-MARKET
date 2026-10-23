'use client';

import Link from 'next/link';
import { useActionState, useMemo, useState, type CSSProperties } from 'react';
import { Bot, Check, Clock3, Cloud, Code2, Crown, Info, MessageSquare, Package, Search, Server, ShieldCheck, Sparkles, TrendingUp, UserRound } from 'lucide-react';
import { createOrderAction } from '@/lib/actions/order';
import { rupiah } from '@/lib/format';
import type { ActionState } from '@/lib/types';
import { SubmitButton } from './submit-button';
import { StateMessage } from './state-message';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceLabel: string;
  kind: 'STANDARD' | 'SMM';
  unit: string;
  minQuantity: number;
  maxQuantity: number;
  requiresQuote: boolean;
  instructions: string | null;
  estimate: string | null;
  guarantee: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  products: Product[];
};

const iconMap = {
  package: Package,
  'trending-up': TrendingUp,
  crown: Crown,
  server: Server,
  bot: Bot,
  cloud: Cloud,
  'message-square': MessageSquare,
  'code-2': Code2,
  sparkles: Sparkles,
};

const colors = ['#ff4058', '#d9213c', '#ff6b57', '#c81e3a', '#ff8a76', '#b91c35', '#f03b51', '#ff5a36', '#dc2646'];

export function Storefront({ categories, user, onlySmm = false }: {
  categories: Category[];
  user: { name: string; whatsapp: string | null } | null;
  onlySmm?: boolean;
}) {
  const visibleCategories = onlySmm ? categories.filter((category) => category.slug === 'smm') : categories;
  const initialCategory = visibleCategories.find((category) => category.slug === 'smm') || visibleCategories[0];
  const [categorySlug, setCategorySlug] = useState(initialCategory?.slug || '');
  const [productId, setProductId] = useState(initialCategory?.products[0]?.id || '');
  const [quantity, setQuantity] = useState(initialCategory?.products[0]?.minQuantity || 1);
  const [search, setSearch] = useState('');
  const [state, formAction] = useActionState<ActionState, FormData>(createOrderAction, {});

  const activeCategory = visibleCategories.find((category) => category.slug === categorySlug) || visibleCategories[0];
  const selectedProduct = activeCategory?.products.find((product) => product.id === productId) || activeCategory?.products[0];
  const filteredProducts = (activeCategory?.products || []).filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));
  const total = useMemo(() => {
    if (!selectedProduct || selectedProduct.requiresQuote) return 0;
    return selectedProduct.kind === 'SMM'
      ? Math.ceil((selectedProduct.price * quantity) / 1000)
      : selectedProduct.price * quantity;
  }, [selectedProduct, quantity]);

  function chooseCategory(category: Category) {
    setCategorySlug(category.slug);
    setProductId(category.products[0]?.id || '');
    setQuantity(category.products[0]?.minQuantity || 1);
    setSearch('');
    setTimeout(() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function chooseProduct(product: Product) {
    setProductId(product.id);
    setQuantity(product.minQuantity);
  }

  return (
    <>
      <div className="service-grid">
        {visibleCategories.map((category, index) => {
          const Icon = iconMap[category.icon as keyof typeof iconMap] || Package;
          return (
            <button
              type="button"
              className={`service-card ${activeCategory?.slug === category.slug ? 'active' : ''}`}
              key={category.id}
              onClick={() => chooseCategory(category)}
              style={{ '--service-color': colors[index % colors.length] } as CSSProperties}
            >
              <span className="service-icon"><Icon size={22} /></span>
              <span>{category.name}</span>
              <small className="muted">{category.products.length} layanan</small>
            </button>
          );
        })}
      </div>

      <div className="panel order-builder" id="order-form">
        <div className="catalog-pane">
          <div className="cluster" style={{ justifyContent: 'space-between' }}>
            <h3>1 • PILIH LAYANAN</h3>
            <span className="badge badge-cyan"><ShieldCheck size={11} /> MANUAL</span>
          </div>
          <p className="muted" style={{ fontSize: 11, lineHeight: 1.7 }}>{activeCategory?.description}</p>
          <div className="search-box field">
            <Search size={16} />
            <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Cari di ${activeCategory?.name || 'layanan'}...`} aria-label="Cari layanan" />
          </div>
          <div className="product-list">
            {filteredProducts.map((product) => (
              <button type="button" key={product.id} className={`product-choice ${selectedProduct?.id === product.id ? 'active' : ''}`} onClick={() => chooseProduct(product)}>
                <span className={`badge ${product.kind === 'SMM' ? 'badge-purple' : product.requiresQuote ? 'badge-yellow' : 'badge-cyan'}`}>
                  {product.kind === 'SMM' ? 'SMM' : product.requiresQuote ? 'PENAWARAN' : 'HARGA TETAP'}
                </span>
                <strong>{product.name}</strong>
                <small>{product.priceLabel}</small>
              </button>
            ))}
          </div>
          {!filteredProducts.length ? <div className="empty-state">Layanan tidak ditemukan.</div> : null}
        </div>

        <div className="checkout-pane">
          <h3>2 • ISI DATA ORDER</h3>
          {selectedProduct ? (
            <form action={formAction} className="stack">
              <input type="hidden" name="productId" value={selectedProduct.id} />
              <div className="selected-product">
                <span className="badge badge-cyan"><Check size={11} /> DIPILIH</span>
                <strong>{selectedProduct.name}</strong>
                <p>{selectedProduct.description}</p>
                {selectedProduct.estimate || selectedProduct.guarantee ? (
                  <div className="service-terms">
                    {selectedProduct.estimate ? <span><Clock3 size={13} /><b>Estimasi:</b> {selectedProduct.estimate}</span> : null}
                    {selectedProduct.guarantee ? <span><ShieldCheck size={13} /><b>Garansi/Refill:</b> {selectedProduct.guarantee}</span> : null}
                  </div>
                ) : null}
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="customerName">Nama Pembeli</label>
                  <input id="customerName" name="customerName" defaultValue={user?.name || ''} required minLength={3} placeholder="Nama lengkap" />
                </div>
                <div className="field">
                  <label htmlFor="whatsapp">Nomor WhatsApp</label>
                  <input id="whatsapp" name="whatsapp" defaultValue={user?.whatsapp || ''} required inputMode="tel" placeholder="08xxxxxxxxxx" />
                </div>

                {selectedProduct.kind === 'SMM' || selectedProduct.slug === 'murband-whatsapp' || selectedProduct.instructions ? (
                  <div className="field field-full">
                    <label htmlFor="target">{selectedProduct.kind === 'SMM' ? 'Link / Username Target' : 'Link / Target Layanan'}</label>
                    <input id="target" name="target" required={selectedProduct.kind === 'SMM' || selectedProduct.slug === 'murband-whatsapp'} placeholder={selectedProduct.kind === 'SMM' ? 'https://... atau @username' : 'https://...'} />
                    {selectedProduct.instructions ? <small>{selectedProduct.instructions}</small> : null}
                  </div>
                ) : null}

                {selectedProduct.requiresQuote ? (
                  <div className="field field-full">
                    <label htmlFor="packageDetails">Detail Paket yang Diinginkan</label>
                    <textarea id="packageDetails" name="packageDetails" required placeholder="Contoh: spesifikasi, durasi, varian, atau budget yang diinginkan..." />
                    <small>Admin meninjau detail ini lalu menetapkan harga akhir sebelum pembayaran.</small>
                  </div>
                ) : null}

                {selectedProduct.kind === 'SMM' || selectedProduct.maxQuantity > 1 ? (
                  <div className="field">
                    <label htmlFor="quantity">Jumlah</label>
                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min={selectedProduct.minQuantity}
                      max={selectedProduct.maxQuantity}
                      value={quantity}
                      onChange={(event) => setQuantity(Number(event.target.value))}
                      required
                    />
                    <small>Min {selectedProduct.minQuantity.toLocaleString('id-ID')} • Max {selectedProduct.maxQuantity.toLocaleString('id-ID')}</small>
                  </div>
                ) : <input type="hidden" name="quantity" value="1" />}

                <div className="field field-full">
                  <label htmlFor="notes">Catatan Tambahan (Opsional)</label>
                  <textarea id="notes" name="notes" placeholder="Catatan untuk admin..." style={{ minHeight: 80 }} />
                </div>
              </div>

              <div className="price-preview">
                <span>{selectedProduct.requiresQuote ? 'Harga Akhir' : 'Total Pembayaran'}</span>
                <strong>{selectedProduct.requiresQuote ? 'DITENTUKAN ADMIN' : rupiah(total)}</strong>
              </div>
              <div className="alert alert-info"><Info size={17} /><span>Pembayaran QRIS dikonfirmasi lewat WhatsApp. Tidak ada aktivasi otomatis.</span></div>
              <StateMessage state={state} />
              {user ? (
                <SubmitButton className="btn btn-primary btn-lg btn-block"><Package size={17} /> BUAT PESANAN</SubmitButton>
              ) : (
                <Link className="btn btn-primary btn-lg btn-block" href="/login?next=%2F%23layanan"><UserRound size={17} /> LOGIN UNTUK ORDER</Link>
              )}
            </form>
          ) : <div className="empty-state">Pilih layanan untuk mulai order.</div>}
        </div>
      </div>
    </>
  );
}
