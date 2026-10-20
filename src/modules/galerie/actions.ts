'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/modules/auth/guards';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { logAudit } from '@/modules/stats/audit';
import { buildGalleryImageKey, validateImageFile } from '@/modules/fichiers/image-validation';
import {
  deleteImageObject,
  isStorageConfigured,
  uploadImageObject,
  getStorageConfigurationHint,
} from '@/modules/fichiers/storage';
import { galleryPhotoIdSchema, galleryPhotoMetaSchema } from './schemas';

export type GalleryActionState = { error?: string; success?: string };

function handleError(error: unknown): GalleryActionState {
  if (error instanceof AppError) return { error: error.message };
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return { error: 'Photo introuvable.' };
  }
  console.error(error);
  return { error: 'Une erreur est survenue. Réessayez plus tard.' };
}

function revalidate() {
  revalidatePath('/dashboard/galerie');
  revalidatePath('/galerie');
}

export async function adminUploadGalleryPhoto(
  _prev: GalleryActionState,
  formData: FormData,
): Promise<GalleryActionState> {
  const user = await requireAdmin();
  if (!user) return { error: 'Accès interdit.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choisissez une photo à envoyer.' };
  }
  if (!isStorageConfigured()) return { error: getStorageConfigurationHint() };

  const consentConfirmed = formData.get('consentConfirmed') === 'on';
  if (!consentConfirmed) {
    return { error: 'La confirmation d’autorisation de la cliente est obligatoire.' };
  }
  const serviceId = String(formData.get('serviceId') ?? '').trim() || null;
  const alt = String(formData.get('alt') ?? '').trim();

  let key: string | null = null;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const validated = validateImageFile({ size: file.size, type: file.type, bytes });
    key = buildGalleryImageKey(validated.extension);
    await uploadImageObject({ key, body: bytes, contentType: validated.mime });

    try {
      await db.galleryPhoto.create({
        data: { key, alt, serviceId, consentConfirmed: true, published: false },
      });
    } catch (databaseError) {
      await deleteImageObject(key).catch(() => undefined);
      throw databaseError;
    }

    await logAudit({ userId: user.id, action: 'gallery.upload', entityType: 'GalleryPhoto' });
    revalidate();
    return { success: 'Photo ajoutée à la galerie (non publiée).' };
  } catch (error) {
    return handleError(error);
  }
}

export async function adminUpdateGalleryPhoto(
  _prev: GalleryActionState,
  formData: FormData,
): Promise<GalleryActionState> {
  const user = await requireAdmin();
  if (!user) return { error: 'Accès interdit.' };

  const parsed = galleryPhotoMetaSchema.safeParse({
    id: formData.get('id'),
    serviceId: formData.get('serviceId'),
    alt: formData.get('alt'),
    consentConfirmed: formData.get('consentConfirmed'),
    published: formData.get('published'),
  });
  if (!parsed.success) return { error: 'Données invalides.' };
  const input = parsed.data;

  if (input.published && !input.consentConfirmed) {
    return { error: 'Impossible de publier sans confirmation d’autorisation de la cliente.' };
  }

  try {
    await db.galleryPhoto.update({
      where: { id: input.id },
      data: {
        serviceId: input.serviceId || null,
        alt: input.alt,
        consentConfirmed: input.consentConfirmed,
        published: input.published,
      },
    });
    await logAudit({
      userId: user.id,
      action: 'gallery.update',
      entityType: 'GalleryPhoto',
      entityId: input.id,
    });
    revalidate();
    return { success: 'Photo mise à jour.' };
  } catch (error) {
    return handleError(error);
  }
}

export async function adminDeleteGalleryPhoto(
  _prev: GalleryActionState,
  formData: FormData,
): Promise<GalleryActionState> {
  const user = await requireAdmin();
  if (!user) return { error: 'Accès interdit.' };

  const parsed = galleryPhotoIdSchema.safeParse({ id: formData.get('id') });
  if (!parsed.success) return { error: 'Identifiant invalide.' };

  try {
    const photo = await db.galleryPhoto.delete({ where: { id: parsed.data.id } });
    await deleteImageObject(photo.key).catch(() => undefined);
    await logAudit({
      userId: user.id,
      action: 'gallery.delete',
      entityType: 'GalleryPhoto',
      entityId: photo.id,
    });
    revalidate();
    return { success: 'Photo supprimée.' };
  } catch (error) {
    return handleError(error);
  }
}
