'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createSession, destroySession, requireUser } from '@/lib/auth';
import { loginSchema, profileSchema, registerSchema } from '@/lib/validation';
import { normalizeWhatsapp, safeNextPath } from '@/lib/format';
import type { ActionState } from '@/lib/types';

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    username: formData.get('username'),
    email: formData.get('email') || '',
    whatsapp: formData.get('whatsapp'),
    password: formData.get('password'),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Data tidak valid.' };
  const data = parsed.data;
  const email = data.email ? data.email : null;

  const existing = await db.user.findFirst({
    where: {
      OR: [
        { username: data.username },
        ...(email ? [{ email }] : []),
      ],
    },
  });
  if (existing) return { error: 'Username atau email sudah digunakan.' };

  let user;
  try {
    user = await db.user.create({
      data: {
        name: data.name,
        username: data.username,
        email,
        whatsapp: normalizeWhatsapp(data.whatsapp),
        passwordHash: await bcrypt.hash(data.password, 12),
        notifications: {
          create: {
            title: 'Selamat datang di SYAD MARKET',
            message: 'Akun berhasil dibuat. Semua pembayaran dan pesanan diproses manual oleh admin.',
          },
        },
      },
    });
  } catch {
    return { error: 'Akun tidak dapat dibuat. Coba username atau email lain.' };
  }

  await createSession(user.id, user.role);
  redirect('/dashboard');
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get('identifier'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Data tidak valid.' };

  const identifier = parsed.data.identifier.toLowerCase();
  const user = await db.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });

  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return { error: 'Username/email atau password salah.' };
  }
  if (!user.active) return { error: 'Akun dinonaktifkan. Hubungi admin.' };

  await createSession(user.id, user.role);
  const fallback = user.role === 'ADMIN' ? '/admin' : '/dashboard';
  redirect(safeNextPath(formData.get('next'), fallback));
}

export async function logoutAction() {
  await destroySession();
  redirect('/');
}

export async function updateProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email') || '',
    whatsapp: formData.get('whatsapp'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Data tidak valid.' };

  const email = parsed.data.email || null;
  if (email) {
    const duplicate = await db.user.findFirst({ where: { email, NOT: { id: user.id } } });
    if (duplicate) return { error: 'Email sudah digunakan akun lain.' };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      email,
      whatsapp: normalizeWhatsapp(parsed.data.whatsapp),
    },
  });
  revalidatePath('/account');
  revalidatePath('/dashboard');
  return { success: 'Profil berhasil disimpan.' };
}

export async function changePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const currentPassword = String(formData.get('currentPassword') || '');
  const newPassword = String(formData.get('newPassword') || '');

  if (newPassword.length < 8 || newPassword.length > 100) {
    return { error: 'Password baru harus 8–100 karakter.' };
  }
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return { error: 'Password saat ini salah.' };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });
  return { success: 'Password berhasil diperbarui.' };
}
