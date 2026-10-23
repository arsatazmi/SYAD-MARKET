'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { writeAudit } from '@/lib/audit';
import type { Role } from '@prisma/client';

export async function updateUserAccessAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get('userId') || '');
  const role = String(formData.get('role') || '');
  const active = formData.get('active') === 'on';
  if (!['MEMBER', 'ADMIN'].includes(role)) throw new Error('Role tidak valid.');
  if (userId === admin.id && (role !== 'ADMIN' || !active)) throw new Error('Anda tidak dapat menurunkan role atau menonaktifkan akun sendiri.');

  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { role: role as Role, active } });
    await writeAudit(tx, admin.id, 'UPDATE_ACCESS', 'User', userId, `${role} / active=${active}`);
  });
  revalidatePath('/admin/users');
}
