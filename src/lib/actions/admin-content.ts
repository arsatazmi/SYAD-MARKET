'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { normalizeWhatsapp } from '@/lib/format';
import { writeAudit } from '@/lib/audit';

function refreshContent() {
  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/admin/content');
  revalidatePath('/admin/api');
}

export async function saveStoreSettingsAction(formData: FormData) {
  const admin = await requireAdmin();
  const storeName = String(formData.get('storeName') || '').trim();
  const tagline = String(formData.get('tagline') || '').trim();
  const whatsapp = normalizeWhatsapp(String(formData.get('whatsapp') || ''));
  const qrisPath = String(formData.get('qrisPath') || '').trim();
  const announcement = String(formData.get('announcement') || '').trim();
  if (storeName.length < 3 || tagline.length < 5 || whatsapp.length < 10 || !qrisPath.startsWith('/')) throw new Error('Pengaturan toko tidak valid.');

  await db.$transaction(async (tx) => {
    await tx.storeSetting.update({
      where: { id: 1 },
      data: { storeName, tagline, whatsapp, qrisPath, announcement },
    });
    await writeAudit(tx, admin.id, 'SAVE_SETTINGS', 'StoreSetting', '1', storeName);
  });
  refreshContent();
}

export async function saveBannerAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get('id') || '');
  const title = String(formData.get('title') || '').trim();
  const subtitle = String(formData.get('subtitle') || '').trim();
  const imagePath = String(formData.get('imagePath') || '').trim();
  const sortOrder = Number(formData.get('sortOrder') || 0);
  if (title.length < 2 || !(imagePath.startsWith('/') || imagePath.startsWith('https://'))) throw new Error('Data banner tidak valid.');
  const data = { title, subtitle: subtitle || null, imagePath, sortOrder, active: formData.get('active') === 'on' };
  const banner = id ? await db.banner.update({ where: { id }, data }) : await db.banner.create({ data });
  await db.auditLog.create({ data: { actorId: admin.id, action: 'SAVE_BANNER', entity: 'Banner', entityId: banner.id, detail: title } });
  refreshContent();
}

export async function createAnnouncementAction(formData: FormData) {
  const admin = await requireAdmin();
  const title = String(formData.get('title') || '').trim();
  const message = String(formData.get('message') || '').trim();
  const sendInbox = formData.get('sendInbox') === 'on';
  if (title.length < 3 || message.length < 5) throw new Error('Pengumuman terlalu pendek.');

  await db.$transaction(async (tx) => {
    const announcement = await tx.announcement.create({ data: { title, message } });
    if (sendInbox) {
      const users = await tx.user.findMany({ where: { active: true }, select: { id: true } });
      await tx.notification.createMany({ data: users.map((user) => ({ userId: user.id, title, message })) });
    }
    await writeAudit(tx, admin.id, 'CREATE_ANNOUNCEMENT', 'Announcement', announcement.id, `inbox=${sendInbox}`);
  });
  refreshContent();
  revalidatePath('/notifications');
}

export async function saveProviderNoteAction(formData: FormData) {
  const admin = await requireAdmin();
  const name = String(formData.get('name') || '').trim().toUpperCase();
  const baseUrl = String(formData.get('baseUrl') || '').trim();
  const apiKeyEnv = String(formData.get('apiKeyEnv') || '').trim().toUpperCase();
  if (name.length < 3 || (baseUrl && !baseUrl.startsWith('https://'))) throw new Error('Provider tidak valid.');
  if (apiKeyEnv && !/^[A-Z][A-Z0-9_]*$/.test(apiKeyEnv)) throw new Error('Nama environment variable tidak valid.');

  await db.$transaction(async (tx) => {
    const provider = await tx.provider.upsert({
      where: { name },
      update: { baseUrl: baseUrl || null, apiKeyEnv: apiKeyEnv || null, enabled: false },
      create: { name, baseUrl: baseUrl || null, apiKeyEnv: apiKeyEnv || null, enabled: false },
    });
    await writeAudit(tx, admin.id, 'SAVE_PROVIDER_NOTE', 'Provider', provider.id, 'Mode tetap MANUAL; secret hanya melalui env.');
  });
  refreshContent();
}
