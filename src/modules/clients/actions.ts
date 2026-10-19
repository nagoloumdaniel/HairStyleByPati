'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { AppError, parseInput } from '@/lib/errors';
import { requireAdmin } from '@/modules/auth/guards';
import { logAudit } from '@/modules/stats/audit';
import { anonymizeCustomerData } from './rgpd';

export type CustomerRgpdState = { success?: string; error?: string };

const contactSchema = z.object({
  customerId: z.string().trim().min(1).max(64),
  name: z.string().trim().min(2, 'Nom requis.').max(100),
  email: z.string().trim().email('E-mail invalide.').max(200),
  phone: z.string().trim().max(30).optional().default(''),
});

const anonymizeSchema = z.object({
  customerId: z.string().trim().min(1).max(64),
  confirm: z.literal('oui', { message: 'Confirmation obligatoire.' }),
});

function handleError(error: unknown): CustomerRgpdState {
  if (error instanceof AppError) return { error: error.message };
  console.error(error);
  return { error: 'Enregistrement impossible. Réessayez.' };
}

export async function updateCustomerContactAction(
  _state: CustomerRgpdState,
  formData: FormData,
): Promise<CustomerRgpdState> {
  try {
    const user = await requireAdmin();
    if (!user) return { error: 'Session expirée.' };
    const input = parseInput(contactSchema, Object.fromEntries(formData));
    await db.customer.update({
      where: { id: input.customerId },
      data: { name: input.name, email: input.email.toLowerCase(), phone: input.phone },
    });
    await logAudit({
      userId: user.id,
      action: 'customer.contact.update',
      entityType: 'Customer',
      entityId: input.customerId,
    }).catch(() => undefined);
    revalidatePath('/dashboard/clients');
    revalidatePath(`/dashboard/clients/${input.customerId}`);
    return { success: 'Coordonnées mises à jour.' };
  } catch (error) {
    return handleError(error);
  }
}

export async function anonymizeCustomerAction(
  _state: CustomerRgpdState,
  formData: FormData,
): Promise<CustomerRgpdState> {
  try {
    const user = await requireAdmin();
    if (!user) return { error: 'Session expirée.' };
    const input = parseInput(anonymizeSchema, Object.fromEntries(formData));
    const result = await anonymizeCustomerData(input.customerId);
    if (!result) return { error: 'Fiche cliente introuvable.' };
    revalidatePath('/dashboard/clients');
    revalidatePath('/dashboard', 'layout');
    return {
      success: `Fiche anonymisée : ${result.conversationsDeleted} conversation(s), ${result.assessmentsDeleted} évaluation(s), ${result.customRequestsDeleted} demande(s) et ${result.photosDeleted} photo(s) supprimées.`,
    };
  } catch (error) {
    return handleError(error);
  }
}
