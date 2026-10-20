'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { requireAdmin } from '@/modules/auth/guards';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { logAudit } from '@/modules/stats/audit';
import { promotionIdSchema, promotionSchema } from './schemas';

export type PromotionActionState = { error?: string; success?: string };

function handleError(error: unknown): PromotionActionState {
  if (error instanceof AppError) return { error: error.message };
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return { error: 'Promotion introuvable.' };
  }
  console.error(error);
  return { error: 'Une erreur est survenue. Réessayez plus tard.' };
}

function parseForm<T extends z.ZodType>(
  schema: T,
  raw: unknown,
): { data: z.infer<T> } | { error: string } {
  const result = schema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Données invalides.' };
  }
  return { data: result.data };
}

function revalidate() {
  revalidatePath('/dashboard/promotions');
  revalidatePath('/coiffures');
}

export async function adminCreatePromotion(
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const user = await requireAdmin();
  if (!user) return { error: 'Accès interdit.' };

  const parsed = parseForm(promotionSchema, {
    name: formData.get('name'),
    kind: formData.get('kind'),
    value: formData.get('value'),
    startsAt: formData.get('startsAt'),
    endsAt: formData.get('endsAt'),
    serviceIds: formData.getAll('serviceIds'),
  });
  if ('error' in parsed) return { error: parsed.error };
  const input = parsed.data;

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { error: 'Dates invalides.' };
  }
  if (endsAt.getTime() <= startsAt.getTime()) {
    return { error: 'La date de fin doit être après la date de début.' };
  }
  const value =
    input.kind === 'PERCENT'
      ? Math.min(100, Math.round(input.value))
      : Math.round(input.value * 100);

  try {
    const promotion = await db.promotion.create({
      data: {
        name: input.name,
        kind: input.kind,
        value,
        startsAt,
        endsAt,
        services: { create: input.serviceIds.map((serviceId) => ({ serviceId })) },
      },
    });
    await logAudit({
      userId: user.id,
      action: 'promotion.create',
      entityType: 'Promotion',
      entityId: promotion.id,
      metadata: { name: promotion.name },
    });
    revalidate();
    return { success: 'Promotion créée.' };
  } catch (error) {
    return handleError(error);
  }
}

export async function adminSetPromotionActive(
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const user = await requireAdmin();
  if (!user) return { error: 'Accès interdit.' };

  const parsed = parseForm(promotionIdSchema, { id: formData.get('id') });
  if ('error' in parsed) return { error: parsed.error };
  const active = formData.get('active') === 'true';

  try {
    await db.promotion.update({ where: { id: parsed.data.id }, data: { active } });
    await logAudit({
      userId: user.id,
      action: 'promotion.toggle',
      entityType: 'Promotion',
      entityId: parsed.data.id,
      metadata: { active },
    });
    revalidate();
    return { success: active ? 'Promotion activée.' : 'Promotion désactivée.' };
  } catch (error) {
    return handleError(error);
  }
}

export async function adminDeletePromotion(
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const user = await requireAdmin();
  if (!user) return { error: 'Accès interdit.' };

  const parsed = parseForm(promotionIdSchema, { id: formData.get('id') });
  if ('error' in parsed) return { error: parsed.error };

  try {
    await db.promotion.delete({ where: { id: parsed.data.id } });
    await logAudit({
      userId: user.id,
      action: 'promotion.delete',
      entityType: 'Promotion',
      entityId: parsed.data.id,
    });
    revalidate();
    return { success: 'Promotion supprimée.' };
  } catch (error) {
    return handleError(error);
  }
}
