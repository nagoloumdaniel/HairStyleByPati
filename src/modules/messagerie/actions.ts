'use server';

import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError, parseInput } from '@/lib/errors';
import { requireAdmin } from '@/modules/auth/guards';
import { logAudit } from '@/modules/stats/audit';
import {
  conversationIdSchema,
  conversationStatusSchema,
  internalNoteSchema,
  replySchema,
} from './schemas';

export type ConversationActionState = { success?: string; error?: string };

function handleError(error: unknown): ConversationActionState {
  if (error instanceof AppError) return { error: error.message };
  console.error(error);
  return { error: 'Une erreur est survenue. Réessayez.' };
}

function revalidateConversations(id?: string): void {
  revalidatePath('/dashboard/messages');
  if (id) revalidatePath(`/dashboard/messages/${id}`);
  revalidatePath('/dashboard', 'layout');
}

export async function adminReplyToConversation(
  _state: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  try {
    const user = await requireAdmin();
    if (!user) return { error: 'Session expirée.' };
    const input = parseInput(replySchema, Object.fromEntries(formData));

    const conversation = await db.conversation.findUnique({
      where: { id: input.conversationId },
      include: { customer: true },
    });
    if (!conversation) return { error: 'Conversation introuvable.' };
    if (!conversation.customer?.email) {
      return { error: 'Aucune adresse e-mail cliente : impossible de répondre.' };
    }

    await db.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId: conversation.id,
          author: 'ADMIN',
          content: input.content,
        },
      });
      await tx.conversation.update({
        where: { id: conversation.id },
        data: { status: 'WAITING_RESPONSE', lastMessageAt: new Date() },
      });
      const payload = {
        kind: 'conversation',
        conversationId: conversation.id,
        customerName: conversation.customer!.name,
        customerEmail: conversation.customer!.email,
        subject: conversation.subject,
        message: input.content,
      } satisfies Prisma.InputJsonValue;
      await tx.notification.createMany({
        data: [
          {
            idempotencyKey: `conversation:${conversation.id}:reply:${message.id}`,
            recipient: conversation.customer!.email,
            templateKey: 'conversation_reply',
            payload,
          },
          {
            idempotencyKey: `conversation:${conversation.id}:reply:${message.id}:inapp`,
            recipient: process.env.ADMIN_EMAIL?.trim() || 'zepatricia7@gmail.com',
            channel: 'IN_APP',
            templateKey: 'conversation_reply_sent',
            link: `/dashboard/messages/${conversation.id}`,
            payload: {
              ...payload,
              link: `/dashboard/messages/${conversation.id}`,
            },
          },
        ],
        skipDuplicates: true,
      });
    });

    await logAudit({
      action: 'conversation.reply',
      entityType: 'Conversation',
      entityId: conversation.id,
      userId: user.id,
    }).catch(() => undefined);
    revalidateConversations(conversation.id);
    return { success: 'Réponse enregistrée et e-mail mis en file d’attente.' };
  } catch (error) {
    return handleError(error);
  }
}

export async function adminAddInternalNote(
  _state: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  try {
    const user = await requireAdmin();
    if (!user) return { error: 'Session expirée.' };
    const input = parseInput(internalNoteSchema, Object.fromEntries(formData));
    const conversation = await db.conversation.findUnique({
      where: { id: input.conversationId },
      select: { id: true },
    });
    if (!conversation) return { error: 'Conversation introuvable.' };

    await db.message.create({
      data: {
        conversationId: conversation.id,
        author: 'ADMIN',
        content: input.content,
        isInternal: true,
      },
    });
    await db.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });
    await logAudit({
      action: 'conversation.internal_note',
      entityType: 'Conversation',
      entityId: conversation.id,
      userId: user.id,
    }).catch(() => undefined);
    revalidateConversations(conversation.id);
    return { success: 'Note interne enregistrée, invisible côté cliente.' };
  } catch (error) {
    return handleError(error);
  }
}

export async function adminSetConversationStatus(
  _state: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  try {
    const user = await requireAdmin();
    if (!user) return { error: 'Session expirée.' };
    const input = parseInput(conversationStatusSchema, Object.fromEntries(formData));
    const existing = await db.conversation.findUnique({
      where: { id: input.conversationId },
      select: { id: true },
    });
    if (!existing) return { error: 'Conversation introuvable.' };

    await db.conversation.update({
      where: { id: input.conversationId },
      data: {
        status: input.status,
        archivedAt: input.status === 'ARCHIVED' ? new Date() : null,
      },
    });
    await logAudit({
      action: 'conversation.status',
      entityType: 'Conversation',
      entityId: input.conversationId,
      userId: user.id,
      metadata: { status: input.status },
    }).catch(() => undefined);
    revalidateConversations(input.conversationId);
    return { success: 'Statut de la conversation mis à jour.' };
  } catch (error) {
    return handleError(error);
  }
}

export async function adminMarkConversationRead(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  if (!user) return;
  const input = parseInput(conversationIdSchema, Object.fromEntries(formData));
  await db.message.updateMany({
    where: {
      conversationId: input.conversationId,
      author: 'CUSTOMER',
      isInternal: false,
      readAt: null,
    },
    data: { readAt: new Date() },
  });
  revalidatePath('/dashboard/messages');
  revalidatePath('/dashboard');
}
