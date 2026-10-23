'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/format';
import { writeAudit } from '@/lib/audit';
import type { ProductKind } from '@prisma/client';

function refreshCatalog() {
  revalidatePath('/');
  revalidatePath('/smm');
  revalidatePath('/admin/products');
}

export async function saveCategoryAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get('id') || '');
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const icon = String(formData.get('icon') || 'package').trim();
  const sortOrder = Number(formData.get('sortOrder') || 0);
  if (name.length < 3 || description.length < 5 || !Number.isInteger(sortOrder)) throw new Error('Data kategori tidak valid.');
  const slug = slugify(String(formData.get('slug') || name));
  if (!slug) throw new Error('Slug kategori tidak valid.');

  const data = { name, slug, description, icon, sortOrder, active: formData.get('active') === 'on' };
  const category = id
    ? await db.category.update({ where: { id }, data })
    : await db.category.create({ data });
  await db.auditLog.create({ data: { actorId: admin.id, action: 'SAVE_CATEGORY', entity: 'Category', entityId: category.id, detail: category.name } });
  refreshCatalog();
}

export async function saveProductAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get('id') || '');
  const name = String(formData.get('name') || '').trim();
  const categoryId = String(formData.get('categoryId') || '');
  const description = String(formData.get('description') || '').trim();
  const priceLabel = String(formData.get('priceLabel') || '').trim();
  const kind = String(formData.get('kind') || 'STANDARD');
  const price = Number(formData.get('price') || 0);
  const minQuantity = Number(formData.get('minQuantity') || 1);
  const maxQuantity = Number(formData.get('maxQuantity') || 1);
  const requiresQuote = formData.get('requiresQuote') === 'on';
  const stockRaw = String(formData.get('stock') || '').trim();
  const stock = stockRaw ? Number(stockRaw) : null;
  const estimate = String(formData.get('estimate') || '').trim();
  const guarantee = String(formData.get('guarantee') || '').trim();

  if (name.length < 2 || description.length < 5 || !priceLabel) throw new Error('Nama, deskripsi, dan label harga wajib diisi.');
  if (!['STANDARD', 'SMM'].includes(kind)) throw new Error('Jenis produk tidak valid.');
  if (!Number.isInteger(price) || price < 0 || price > 1000000000) throw new Error('Harga tidak valid.');
  if (!requiresQuote && price <= 0) throw new Error('Produk tanpa penawaran harus mempunyai harga lebih dari nol.');
  if (!Number.isInteger(minQuantity) || !Number.isInteger(maxQuantity) || minQuantity < 1 || maxQuantity < minQuantity || maxQuantity > 100000000) throw new Error('Batas jumlah tidak valid.');
  if (stock !== null && (!Number.isInteger(stock) || stock < 0 || stock > 2000000000)) throw new Error('Stok tidak valid.');
  if (estimate.length > 500 || guarantee.length > 500) throw new Error('Estimasi atau detail garansi terlalu panjang.');

  const slug = slugify(String(formData.get('slug') || name));
  if (!slug || !categoryId) throw new Error('Slug dan kategori wajib diisi.');
  const data = {
    name,
    slug,
    categoryId,
    description,
    priceLabel,
    kind: kind as ProductKind,
    price,
    unit: kind === 'SMM' ? '1000' : 'order',
    minQuantity,
    maxQuantity,
    requiresQuote,
    stock,
    active: formData.get('active') === 'on',
    featured: formData.get('featured') === 'on',
    fulfillmentMode: 'MANUAL' as const,
    estimate: estimate || null,
    guarantee: guarantee || null,
    providerName: String(formData.get('providerName') || '').trim() || null,
    providerServiceId: String(formData.get('providerServiceId') || '').trim() || null,
    instructions: String(formData.get('instructions') || '').trim() || null,
  };

  const product = id
    ? await db.product.update({ where: { id }, data })
    : await db.product.create({ data });
  await db.auditLog.create({
    data: { actorId: admin.id, action: 'SAVE_PRODUCT', entity: 'Product', entityId: product.id, detail: `${product.name} / MANUAL` },
  });
  refreshCatalog();
}
