'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { AppError, parseInput } from '@/lib/errors';
import { requireAdmin } from '@/modules/auth/guards';
import { logAudit } from '@/modules/stats/audit';

export type SalonProfileState = { success?: string; error?: string };

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Nom du salon requis.').max(120),
  contactEmail: z.string().trim().email('E-mail invalide.').max(200).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().default(''),
  address: z.string().trim().max(300).optional().default(''),
  openingHoursText: z.string().trim().max(2000).optional().default(''),
  emailSignature: z.string().trim().max(1000).optional().default(''),
  cancellationPolicy: z.string().trim().max(3000).optional().default(''),
  bookingPolicy: z.string().trim().max(3000).optional().default(''),
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default('')
    .refine((value) => value === '' || /^https?:\/\//.test(value), {
      message: 'L’adresse du logo doit commencer par http(s).',
    }),
});

function handleError(error: unknown): SalonProfileState {
  if (error instanceof AppError) return { error: error.message };
  console.error(error);
  return { error: 'Enregistrement impossible. Réessayez.' };
}

export async function adminSaveSalonProfile(
  _state: SalonProfileState,
  formData: FormData,
): Promise<SalonProfileState> {
  try {
    const user = await requireAdmin();
    if (!user) return { error: 'Session expirée.' };
    const input = parseInput(profileSchema, Object.fromEntries(formData));

    let openingHours: unknown = null;
    if (input.openingHoursText) {
      try {
        openingHours = JSON.parse(input.openingHoursText);
      } catch {
        return { error: 'Horaires illisibles : utilisez un tableau JSON valide.' };
      }
    }

    await db.salonSettings.upsert({
      where: { id: 1 },
      update: {
        name: input.name,
        contactEmail: input.contactEmail || null,
        phone: input.phone || null,
        address: input.address || null,
        openingHours: openingHours === null ? undefined : (openingHours as object),
        emailSignature: input.emailSignature || null,
        cancellationPolicy: input.cancellationPolicy || null,
        bookingPolicy: input.bookingPolicy || null,
        logoUrl: input.logoUrl || null,
      },
      create: {
        id: 1,
        name: input.name,
        contactEmail: input.contactEmail || null,
        phone: input.phone || null,
        address: input.address || null,
        openingHours: openingHours === null ? undefined : (openingHours as object),
        emailSignature: input.emailSignature || null,
        cancellationPolicy: input.cancellationPolicy || null,
        bookingPolicy: input.bookingPolicy || null,
        logoUrl: input.logoUrl || null,
      },
    });
    await logAudit({
      userId: user.id,
      action: 'settings.profile.update',
      entityType: 'SalonSettings',
      entityId: '1',
    }).catch(() => undefined);
    revalidateTag('salon-settings');
    revalidatePath('/dashboard/parametres');
    revalidatePath('/dashboard', 'layout');
    return { success: 'Identité et paramètres du salon enregistrés.' };
  } catch (error) {
    return handleError(error);
  }
}
