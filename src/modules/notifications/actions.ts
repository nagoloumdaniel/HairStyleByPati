'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { AppError, parseInput } from '@/lib/errors';
import { requireAdmin } from '@/modules/auth/guards';
import { logAudit } from '@/modules/stats/audit';
import { retryNotification } from './service';

function handleError(error: unknown): NotificationActionState {
  if (error instanceof AppError) return { error: error.message };
  console.error(error);
  return { error: 'Une erreur est survenue. Réessayez.' };
}

const idSchema = z.object({ id: z.string().trim().min(1).max(64) });

export type NotificationActionState = { success?: string; error?: string };
export async function markNotificationRead(
  _state: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> {
  try {
    const user = await requireAdmin();
    if (!user) return { error: 'Session expirée.' };
    const { id } = parseInput(idSchema, Object.fromEntries(formData));
    await db.notification.updateMany({
      where: { id, channel: 'IN_APP', readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath('/dashboard/notifications');
    revalidatePath('/dashboard', 'layout');
    return { success: 'Notification marquée comme lue.' };
  } catch (error) {
    return handleError(error);
  }
}

export async function markAllNotificationsRead(): Promise<NotificationActionState> {
  try {
    const user = await requireAdmin();
    if (!user) return { error: 'Session expirée.' };
    const result = await db.notification.updateMany({
      where: { channel: 'IN_APP', readAt: null },
      data: { readAt: new Date() },
    });
    revalidatePath('/dashboard/notifications');
    revalidatePath('/dashboard', 'layout');
    return { success: `${result.count} notification(s) marquée(s) comme lues.` };
  } catch (error) {
    return handleError(error);
  }
}

export async function retryFailedNotification(
  _state: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> {
  try {
    const user = await requireAdmin();
    if (!user) return { error: 'Session expirée.' };
    const { id } = parseInput(idSchema, Object.fromEntries(formData));
    const retried = await retryNotification(id);
    if (!retried) return { error: 'Cette notification ne peut pas être relancée.' };
    await logAudit({
      action: 'notification.retry',
      entityType: 'Notification',
      entityId: id,
      userId: user.id,
    });
    revalidatePath('/dashboard/notifications');
    return { success: 'Envoi remis en file d’attente.' };
  } catch (error) {
    return handleError(error);
  }
}

/* Wrappers pour les formulaires serveur, qui n'affichent pas d'état local. */
export async function markNotificationReadForm(formData: FormData): Promise<void> {
  await markNotificationRead({}, formData);
}

export async function markAllNotificationsReadForm(): Promise<void> {
  await markAllNotificationsRead();
}

export async function retryNotificationForm(formData: FormData): Promise<void> {
  await retryFailedNotification({}, formData);
}
