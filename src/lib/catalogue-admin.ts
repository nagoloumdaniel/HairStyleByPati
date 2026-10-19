import { Prisma } from '@prisma/client';
import type { AnswerType, HairLength, PhotoPolicy, ServiceStatus } from '@prisma/client';
import { db } from './db';
import { AppError } from './errors';

/* ============================================================
 * Couche service admin catalogue (Phase 4) — opérations Prisma.
 * Les données sont validées par Zod dans les server actions ;
 * ces fonctions restent utilisables et testables côté serveur.
 * ============================================================ */

/* ------------------------------------------------------------------ */
/* Catégories (P4.2)                                                   */
/* ------------------------------------------------------------------ */

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  active: boolean;
  serviceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function listAdminCategories(): Promise<AdminCategory[]> {
  const rows = await db.category.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      order: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { services: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    order: row.order,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    serviceCount: row._count.services,
  }));
}

export async function getAdminCategory(id: string) {
  return db.category.findUnique({ where: { id } });
}

export async function categorySlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await db.category.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return !!existing;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  order: number;
  active: boolean;
}) {
  if (await categorySlugExists(data.slug)) {
    throw new AppError('DUPLICATE', 'Cette catégorie existe déjà.', 409);
  }
  return db.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      order: data.order,
      active: data.active,
    },
  });
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    order?: number;
    active?: boolean;
  },
) {
  const category = await db.category.findUnique({ where: { id } });
  if (!category) throw new AppError('NOT_FOUND', 'Catégorie introuvable.', 404);

  if (data.slug != null && data.slug !== category.slug) {
    if (await categorySlugExists(data.slug, id)) {
      throw new AppError('DUPLICATE', 'Cette catégorie existe déjà.', 409);
    }
  }

  return db.category.update({
    where: { id },
    data: {
      ...(data.name != null ? { name: data.name } : {}),
      ...(data.slug != null ? { slug: data.slug } : {}),
      ...(data.description != null ? { description: data.description } : {}),
      ...(data.order != null ? { order: data.order } : {}),
      ...(data.active != null ? { active: data.active } : {}),
    },
  });
}

export async function deleteCategory(id: string) {
  const category = await db.category.findUnique({
    where: { id },
    select: { id: true, _count: { select: { services: true } } },
  });
  if (!category) throw new AppError('NOT_FOUND', 'Catégorie introuvable.', 404);
  if (category._count.services > 0) {
    throw new AppError(
      'CONFLICT',
      'Impossible de supprimer : des prestations sont associées à cette catégorie.',
      409,
    );
  }
  return db.category.delete({ where: { id } });
}

export async function setCategoryActive(id: string, active: boolean) {
  const category = await db.category.findUnique({ where: { id }, select: { id: true } });
  if (!category) throw new AppError('NOT_FOUND', 'Catégorie introuvable.', 404);
  return db.category.update({ where: { id }, data: { active } });
}

export async function reorderCategories(items: { id: string; order: number }[]) {
  const count = await db.category.count({ where: { id: { in: items.map((item) => item.id) } } });
  if (count !== items.length) {
    throw new AppError('NOT_FOUND', 'Une catégorie du réordonnancement est introuvable.', 404);
  }
  await db.$transaction(
    items.map(({ id, order }) => db.category.update({ where: { id }, data: { order } })),
  );
}

/* ------------------------------------------------------------------ */
/* Prestations (P4.3)                                                  */
/* ------------------------------------------------------------------ */

export interface AdminService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  priceFromCents: number | null;
  priceToCents: number | null;
  priceOnRequest: boolean;
  durationMinutes: number | null;
  status: ServiceStatus;
  order: number;
  imageCount: number;
  optionCount: number;
  appointmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminServiceFilters {
  search?: string;
  categoryId?: string;
  status?: ServiceStatus;
}

export interface ServiceWriteInput {
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  priceFromCents: number | null;
  priceToCents: number | null;
  priceOnRequest: boolean;
  durationMinutes: number | null;
  status: ServiceStatus;
  order: number;
}

export async function listAdminServices(
  filters: AdminServiceFilters = {},
): Promise<AdminService[]> {
  const where: Prisma.ServiceWhereInput = {};
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.status) where.status = filters.status;

  const rows = await db.service.findMany({
    where,
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      categoryId: true,
      category: { select: { name: true, slug: true } },
      priceFromCents: true,
      priceToCents: true,
      priceOnRequest: true,
      durationMinutes: true,
      status: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { images: true, options: true, appointments: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    categoryId: row.categoryId,
    categoryName: row.category.name,
    categorySlug: row.category.slug,
    priceFromCents: row.priceFromCents,
    priceToCents: row.priceToCents,
    priceOnRequest: row.priceOnRequest,
    durationMinutes: row.durationMinutes,
    status: row.status,
    order: row.order,
    imageCount: row._count.images,
    optionCount: row._count.options,
    appointmentCount: row._count.appointments,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export interface AdminServiceImage {
  id: string;
  key: string;
  alt: string;
  order: number;
  isPrimary: boolean;
}

export interface AdminServiceOption {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
  active: boolean;
}

export interface AdminQuestion {
  id: string;
  key: string;
  label: string;
  type: AnswerType;
  options: string[];
  required: boolean;
  order: number;
  active: boolean;
  condition: Prisma.JsonValue | null;
}

export interface AdminCompatibilityRule {
  acceptedLengths: HairLength[];
  acceptedHairTypes: string[];
  requiresLocs: boolean;
  incompatibleLocs: boolean;
  photoPolicy: PhotoPolicy;
  autoApprove: boolean;
  conditionsNote: string | null;
  incompatibleMessage: string | null;
  uncertainMessage: string | null;
}

export interface AdminServiceDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  priceFromCents: number | null;
  priceToCents: number | null;
  priceOnRequest: boolean;
  durationMinutes: number | null;
  status: ServiceStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  images: AdminServiceImage[];
  options: AdminServiceOption[];
  compatibility: AdminCompatibilityRule | null;
  questions: AdminQuestion[];
  appointmentCount: number;
}

export async function getAdminServiceDetail(id: string): Promise<AdminServiceDetail | null> {
  const service = await db.service.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
      options: { orderBy: { name: 'asc' } },
      compatibility: true,
      questions: { orderBy: [{ order: 'asc' }, { label: 'asc' }] },
      _count: { select: { appointments: true } },
    },
  });
  if (!service) return null;

  return {
    id: service.id,
    name: service.name,
    slug: service.slug,
    description: service.description,
    categoryId: service.categoryId,
    categoryName: service.category.name,
    priceFromCents: service.priceFromCents,
    priceToCents: service.priceToCents,
    priceOnRequest: service.priceOnRequest,
    durationMinutes: service.durationMinutes,
    status: service.status,
    order: service.order,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    images: service.images.map((image) => ({
      id: image.id,
      key: image.key,
      alt: image.alt,
      order: image.order,
      isPrimary: image.isPrimary,
    })),
    options: service.options.map((option) => ({
      id: option.id,
      name: option.name,
      priceCents: option.priceCents,
      durationMinutes: option.durationMinutes,
      active: option.active,
    })),
    compatibility: service.compatibility
      ? {
          acceptedLengths: service.compatibility.acceptedLengths,
          acceptedHairTypes: service.compatibility.acceptedHairTypes,
          requiresLocs: service.compatibility.requiresLocs,
          incompatibleLocs: service.compatibility.incompatibleLocs,
          photoPolicy: service.compatibility.photoPolicy,
          autoApprove: service.compatibility.autoApprove,
          conditionsNote: service.compatibility.conditionsNote,
          incompatibleMessage: service.compatibility.incompatibleMessage,
          uncertainMessage: service.compatibility.uncertainMessage,
        }
      : null,
    questions: service.questions.map((question) => ({
      id: question.id,
      key: question.key,
      label: question.label,
      type: question.type,
      options: question.options,
      required: question.required,
      order: question.order,
      active: question.active,
      condition: question.condition,
    })),
    appointmentCount: service._count.appointments,
  };
}

export interface CatalogueStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  categories: number;
}

export async function getCatalogueStats(): Promise<CatalogueStats> {
  const [total, published, draft, archived, categories] = await Promise.all([
    db.service.count(),
    db.service.count({ where: { status: 'PUBLISHED' } }),
    db.service.count({ where: { status: 'DRAFT' } }),
    db.service.count({ where: { status: 'ARCHIVED' } }),
    db.category.count(),
  ]);
  return { total, published, draft, archived, categories };
}

export async function serviceSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await db.service.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return !!existing;
}

async function assertCategoryExists(categoryId: string) {
  const category = await db.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) throw new AppError('NOT_FOUND', 'Catégorie introuvable.', 404);
}

export async function createService(data: ServiceWriteInput) {
  await assertCategoryExists(data.categoryId);
  if (await serviceSlugExists(data.slug)) {
    throw new AppError('DUPLICATE', 'Cette prestation existe déjà.', 409);
  }
  return db.service.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      categoryId: data.categoryId,
      priceFromCents: data.priceFromCents,
      priceToCents: data.priceToCents,
      priceOnRequest: data.priceOnRequest,
      durationMinutes: data.durationMinutes,
      status: data.status,
      order: data.order,
    },
  });
}

export async function updateService(id: string, data: ServiceWriteInput) {
  const service = await db.service.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!service) throw new AppError('NOT_FOUND', 'Prestation introuvable.', 404);
  await assertCategoryExists(data.categoryId);
  if (data.slug !== service.slug && (await serviceSlugExists(data.slug, id))) {
    throw new AppError('DUPLICATE', 'Cette prestation existe déjà.', 409);
  }
  return db.service.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      categoryId: data.categoryId,
      priceFromCents: data.priceFromCents,
      priceToCents: data.priceToCents,
      priceOnRequest: data.priceOnRequest,
      durationMinutes: data.durationMinutes,
      status: data.status,
      order: data.order,
    },
  });
}

export async function setServiceStatus(id: string, status: ServiceStatus) {
  const service = await db.service.findUnique({ where: { id }, select: { id: true } });
  if (!service) throw new AppError('NOT_FOUND', 'Prestation introuvable.', 404);
  return db.service.update({ where: { id }, data: { status } });
}

/**
 * P4.6 : une prestation ayant des réservations historiques n'est JAMAIS
 * supprimée, elle est seulement archivée. La suppression n'est permise
 * que si aucun rendez-vous n'y est rattaché.
 */
export async function archiveService(id: string) {
  const service = await db.service.findUnique({ where: { id }, select: { id: true } });
  if (!service) throw new AppError('NOT_FOUND', 'Prestation introuvable.', 404);
  return db.service.update({ where: { id }, data: { status: 'ARCHIVED' } });
}

export async function deleteService(id: string) {
  const service = await db.service.findUnique({
    where: { id },
    select: { id: true, _count: { select: { appointments: true } } },
  });
  if (!service) throw new AppError('NOT_FOUND', 'Prestation introuvable.', 404);
  if (service._count.appointments > 0) {
    throw new AppError(
      'CONFLICT',
      'Cette prestation a des réservations historiques : archivez-la au lieu de la supprimer.',
      409,
    );
  }
  return db.service.delete({ where: { id } });
}

/* ------------------------------------------------------------------ */
/* Options payantes (P4.3)                                             */
/* ------------------------------------------------------------------ */

export async function createServiceOption(
  serviceId: string,
  data: { name: string; priceCents: number; durationMinutes: number; active: boolean },
) {
  const service = await db.service.findUnique({ where: { id: serviceId }, select: { id: true } });
  if (!service) throw new AppError('NOT_FOUND', 'Prestation introuvable.', 404);
  return db.serviceOption.create({ data: { serviceId, ...data } });
}

export async function updateServiceOption(
  optionId: string,
  data: { name: string; priceCents: number; durationMinutes: number; active: boolean },
) {
  const option = await db.serviceOption.findUnique({
    where: { id: optionId },
    select: { id: true },
  });
  if (!option) throw new AppError('NOT_FOUND', 'Option introuvable.', 404);
  return db.serviceOption.update({ where: { id: optionId }, data });
}

export async function setServiceOptionActive(optionId: string, active: boolean) {
  const option = await db.serviceOption.findUnique({
    where: { id: optionId },
    select: { id: true },
  });
  if (!option) throw new AppError('NOT_FOUND', 'Option introuvable.', 404);
  return db.serviceOption.update({ where: { id: optionId }, data: { active } });
}

export async function deleteServiceOption(optionId: string) {
  const option = await db.serviceOption.findUnique({
    where: { id: optionId },
    select: { id: true },
  });
  if (!option) throw new AppError('NOT_FOUND', 'Option introuvable.', 404);
  return db.serviceOption.delete({ where: { id: optionId } });
}

/* ------------------------------------------------------------------ */
/* Photos de prestation (P4.4, P4.5)                                   */
/* ------------------------------------------------------------------ */

export const MAX_SERVICE_IMAGES = 8;

export async function addServiceImage(serviceId: string, key: string, alt: string) {
  const service = await db.service.findUnique({ where: { id: serviceId }, select: { id: true } });
  if (!service) throw new AppError('NOT_FOUND', 'Prestation introuvable.', 404);

  const count = await db.serviceImage.count({ where: { serviceId } });
  if (count >= MAX_SERVICE_IMAGES) {
    throw new AppError(
      'LIMIT',
      `Cette prestation a déjà ${MAX_SERVICE_IMAGES} photos, le maximum autorisé.`,
      409,
    );
  }
  const last = await db.serviceImage.findFirst({
    where: { serviceId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  return db.serviceImage.create({
    data: {
      serviceId,
      key,
      alt,
      order: (last?.order ?? -1) + 1,
      isPrimary: count === 0,
    },
  });
}

export async function getServiceImage(imageId: string) {
  return db.serviceImage.findUnique({ where: { id: imageId } });
}

/** Clés S3 des photos d'une prestation, pour nettoyer le stockage avant suppression. */
export async function getServiceImageKeys(serviceId: string): Promise<string[]> {
  const images = await db.serviceImage.findMany({
    where: { serviceId },
    select: { key: true },
  });
  return images.map((image) => image.key);
}

export async function updateServiceImageAlt(imageId: string, alt: string) {
  const image = await db.serviceImage.findUnique({ where: { id: imageId }, select: { id: true } });
  if (!image) throw new AppError('NOT_FOUND', 'Photo introuvable.', 404);
  return db.serviceImage.update({ where: { id: imageId }, data: { alt } });
}

export async function setPrimaryServiceImage(serviceId: string, imageId: string) {
  const image = await db.serviceImage.findFirst({
    where: { id: imageId, serviceId },
    select: { id: true },
  });
  if (!image) throw new AppError('NOT_FOUND', 'Photo introuvable.', 404);
  await db.$transaction([
    db.serviceImage.updateMany({ where: { serviceId }, data: { isPrimary: false } }),
    db.serviceImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);
}

export async function deleteServiceImage(imageId: string) {
  const image = await db.serviceImage.findUnique({
    where: { id: imageId },
    select: { id: true, serviceId: true, isPrimary: true, key: true },
  });
  if (!image) throw new AppError('NOT_FOUND', 'Photo introuvable.', 404);

  await db.serviceImage.delete({ where: { id: imageId } });

  if (image.isPrimary) {
    const next = await db.serviceImage.findFirst({
      where: { serviceId: image.serviceId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });
    if (next) {
      await db.serviceImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }
  return image;
}

export async function reorderServiceImages(serviceId: string, orderedIds: string[]) {
  const images = await db.serviceImage.findMany({
    where: { serviceId },
    select: { id: true },
  });
  if (images.length !== orderedIds.length) {
    throw new AppError('CONFLICT', 'La liste des photos a changé, rechargez la page.', 409);
  }
  const known = new Set(images.map((image) => image.id));
  if (orderedIds.some((id) => !known.has(id))) {
    throw new AppError('CONFLICT', 'Photo inconnue dans le réordonnancement.', 409);
  }
  await db.$transaction(
    orderedIds.map((id, index) =>
      db.serviceImage.update({ where: { id }, data: { order: index } }),
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Règles de compatibilité (P4.7)                                      */
/* ------------------------------------------------------------------ */

export async function getCompatibilityRule(serviceId: string) {
  return db.compatibilityRule.findUnique({ where: { serviceId } });
}

export async function upsertCompatibilityRule(
  serviceId: string,
  data: {
    acceptedLengths: HairLength[];
    acceptedHairTypes: string[];
    requiresLocs: boolean;
    incompatibleLocs: boolean;
    photoPolicy: PhotoPolicy;
    autoApprove: boolean;
    conditionsNote: string;
    incompatibleMessage: string;
    uncertainMessage: string;
  },
) {
  const service = await db.service.findUnique({ where: { id: serviceId }, select: { id: true } });
  if (!service) throw new AppError('NOT_FOUND', 'Prestation introuvable.', 404);

  return db.compatibilityRule.upsert({
    where: { serviceId },
    create: {
      serviceId,
      acceptedLengths: data.acceptedLengths,
      acceptedHairTypes: data.acceptedHairTypes,
      requiresLocs: data.requiresLocs,
      incompatibleLocs: data.incompatibleLocs,
      photoPolicy: data.photoPolicy,
      autoApprove: data.autoApprove,
      conditionsNote: data.conditionsNote || null,
      incompatibleMessage: data.incompatibleMessage || null,
      uncertainMessage: data.uncertainMessage || null,
    },
    update: {
      acceptedLengths: data.acceptedLengths,
      acceptedHairTypes: data.acceptedHairTypes,
      requiresLocs: data.requiresLocs,
      incompatibleLocs: data.incompatibleLocs,
      photoPolicy: data.photoPolicy,
      autoApprove: data.autoApprove,
      conditionsNote: data.conditionsNote || null,
      incompatibleMessage: data.incompatibleMessage || null,
      uncertainMessage: data.uncertainMessage || null,
    },
  });
}

/* ------------------------------------------------------------------ */
/* Questions capillaires (P4.8)                                        */
/* ------------------------------------------------------------------ */

async function questionKeyExists(serviceId: string, key: string, excludeId?: string) {
  const existing = await db.questionDefinition.findFirst({
    where: { serviceId, key, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return !!existing;
}

export async function createServiceQuestion(
  serviceId: string,
  data: {
    key: string;
    label: string;
    type: AnswerType;
    options: string[];
    required: boolean;
    active: boolean;
    order: number;
    condition: Prisma.InputJsonValue | null;
  },
) {
  const service = await db.service.findUnique({ where: { id: serviceId }, select: { id: true } });
  if (!service) throw new AppError('NOT_FOUND', 'Prestation introuvable.', 404);
  if (await questionKeyExists(serviceId, data.key)) {
    throw new AppError('DUPLICATE', 'Une question utilise déjà cette clé.', 409);
  }
  return db.questionDefinition.create({
    data: {
      serviceId,
      key: data.key,
      label: data.label,
      type: data.type,
      options: data.options,
      required: data.required,
      active: data.active,
      order: data.order,
      condition: data.condition ?? undefined,
    },
  });
}

export async function updateServiceQuestion(
  questionId: string,
  data: {
    key: string;
    label: string;
    type: AnswerType;
    options: string[];
    required: boolean;
    active: boolean;
    order: number;
    condition: Prisma.InputJsonValue | null;
  },
) {
  const question = await db.questionDefinition.findUnique({
    where: { id: questionId },
    select: { id: true, serviceId: true },
  });
  if (!question) throw new AppError('NOT_FOUND', 'Question introuvable.', 404);
  if (await questionKeyExists(question.serviceId, data.key, questionId)) {
    throw new AppError('DUPLICATE', 'Une question utilise déjà cette clé.', 409);
  }
  return db.questionDefinition.update({
    where: { id: questionId },
    data: {
      key: data.key,
      label: data.label,
      type: data.type,
      options: data.options,
      required: data.required,
      active: data.active,
      order: data.order,
      condition: data.condition === null ? Prisma.JsonNull : data.condition,
    },
  });
}

export async function deleteServiceQuestion(questionId: string) {
  const question = await db.questionDefinition.findUnique({
    where: { id: questionId },
    select: { id: true },
  });
  if (!question) throw new AppError('NOT_FOUND', 'Question introuvable.', 404);
  return db.questionDefinition.delete({ where: { id: questionId } });
}

export async function reorderServiceQuestions(
  serviceId: string,
  items: { id: string; order: number }[],
) {
  const questions = await db.questionDefinition.findMany({
    where: { serviceId },
    select: { id: true },
  });
  const known = new Set(questions.map((question) => question.id));
  if (items.some((item) => !known.has(item.id))) {
    throw new AppError('CONFLICT', 'Question inconnue dans le réordonnancement.', 409);
  }
  await db.$transaction(
    items.map((item) =>
      db.questionDefinition.update({ where: { id: item.id }, data: { order: item.order } }),
    ),
  );
}
