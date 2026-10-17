import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

interface AuditParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, Prisma.InputJsonValue>;
}

/**
 * Journalisation d'audit (P1.10, §14.4) : chaque action importante est
 * tracée en base + en log serveur. Ne JAMAIS y mettre de données
 * sensibles (mots de passe, tokens, photos).
 */
export async function logAudit(params: AuditParams): Promise<void> {
  const { userId, action, entityType, entityId, metadata } = params;

  console.info(`[audit] ${action} ${entityType}${entityId ? `#${entityId}` : ''}`, {
    userId: userId ?? 'anonymous',
    ...metadata,
  });

  await db.auditLog.create({
    data: {
      userId: userId ?? null,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ?? undefined,
    },
  });
}
