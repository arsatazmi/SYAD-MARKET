'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { writeAudit } from '@/lib/audit';

export async function toggleAnnouncementAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get('id') || '');
  const active = formData.get('active') === 'true';
  await db.$transaction(async (tx) => {
    await tx.announcement.update({ where: { id }, data: { active } });
    await writeAudit(tx, admin.id, active ? 'SHOW_ANNOUNCEMENT' : 'HIDE_ANNOUNCEMENT', 'Announcement', id);
  });
  revalidatePath('/admin/content');
  revalidatePath('/dashboard');
  revalidatePath('/');
}
