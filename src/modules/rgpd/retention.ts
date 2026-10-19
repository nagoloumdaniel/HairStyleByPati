import { db } from '@/lib/db';
import { getSalonSettings } from '@/modules/disponibilites/queries';
import { deletePrivateImages } from '@/modules/fichiers/private-images';

/* ============================================================
 * P9.7 : purge automatique des photos privées.
 * Des photos orphelines ou expirées ne doivent jamais rester
 * indéfiniment sur le stockage objet.
 * ============================================================ */

export function retentionCutoff(now: Date, days: number): Date {
  return new Date(now.getTime() - Math.max(0, days) * 24 * 60 * 60_000);
}

export interface RetentionSummary {
  assessmentsPurged: number;
  customRequestsPurged: number;
  photosDeleted: number;
  cancelTokensCleared: number;
  cutoff: string;
  photoRetentionDays: number;
}

export async function purgeExpiredPhotoData(options?: { now?: Date }): Promise<RetentionSummary> {
  const now = options?.now ?? new Date();
  const settings = await getSalonSettings();
  const cutoff = retentionCutoff(now, settings.photoRetentionDays);

  const [assessments, customRequests] = await Promise.all([
    db.hairAssessment.findMany({
      where: { photoKeys: { isEmpty: false }, createdAt: { lt: cutoff } },
      select: { id: true, photoKeys: true },
      take: 100,
    }),
    db.customRequest.findMany({
      where: { photoKeys: { isEmpty: false }, createdAt: { lt: cutoff } },
      select: { id: true, photoKeys: true },
      take: 100,
    }),
  ]);

  let assessmentsPurged = 0;
  let customRequestsPurged = 0;
  let photosDeleted = 0;

  for (const assessment of assessments) {
    await deletePrivateImages(assessment.photoKeys);
    await db.hairAssessment.update({
      where: { id: assessment.id },
      data: { photoKeys: [] },
    });
    assessmentsPurged += 1;
    photosDeleted += assessment.photoKeys.length;
  }

  for (const request of customRequests) {
    await deletePrivateImages(request.photoKeys);
    await db.customRequest.update({
      where: { id: request.id },
      data: { photoKeys: [] },
    });
    customRequestsPurged += 1;
    photosDeleted += request.photoKeys.length;
  }

  // Les liens d'annulation expirés ne doivent plus rester utilisables ni stockés.
  const cleared = await db.appointment.updateMany({
    where: { cancelTokenExpiresAt: { lt: now }, cancelToken: { not: null } },
    data: { cancelToken: null },
  });

  return {
    assessmentsPurged,
    customRequestsPurged,
    photosDeleted,
    cancelTokensCleared: cleared.count,
    cutoff: cutoff.toISOString(),
    photoRetentionDays: settings.photoRetentionDays,
  };
}
