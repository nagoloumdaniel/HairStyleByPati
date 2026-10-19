import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { deletePrivateImages } from '@/modules/fichiers/private-images';

/* ============================================================
 * P9.6 : droits RGPD d'accès et d'effacement.
 * L'effacement anonymise la fiche et supprime les contenus privés.
 * Les rendez-vous sont conservés pour les obligations comptables,
 * sans données capillaires, commentaire, lien d'annulation ni identité.
 * ============================================================ */

export interface CustomerDataExport {
  exportedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  } | null;
  appointments: Array<{
    id: string;
    startsAt: string;
    status: string;
    serviceName: string;
    priceCents: number | null;
    durationMinutes: number;
    hairInfo: Prisma.JsonValue | null;
    comments: string | null;
  }>;
  assessments: Array<{
    id: string;
    createdAt: string;
    status: string;
    serviceName: string;
    answers: Prisma.JsonValue;
    photoCount: number;
  }>;
  customRequests: Array<{
    id: string;
    createdAt: string;
    status: string;
    description: string;
    decisionMessage: string | null;
    estimatedPriceCents: number | null;
    photoCount: number;
  }>;
  conversations: Array<{
    id: string;
    subject: string;
    status: string;
    createdAt: string;
    messages: Array<{ author: string; content: string; sentAt: string }>;
  }>;
}

/** Export lisible par la personne concernée. Les notes internes sont exclues. */
export async function collectCustomerData(id: string): Promise<CustomerDataExport | null> {
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { startsAt: 'desc' },
        include: { service: { select: { name: true } } },
      },
      assessments: {
        orderBy: { createdAt: 'desc' },
        include: { service: { select: { name: true } } },
      },
      customRequests: { orderBy: { createdAt: 'desc' } },
      conversations: {
        orderBy: { lastMessageAt: 'desc' },
        include: {
          messages: {
            where: { isInternal: false },
            orderBy: { sentAt: 'asc' },
          },
        },
      },
    },
  });
  if (!customer) return null;

  return {
    exportedAt: new Date().toISOString(),
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt.toISOString(),
    },
    appointments: customer.appointments.map((appointment) => ({
      id: appointment.id,
      startsAt: appointment.startsAt.toISOString(),
      status: appointment.status,
      serviceName: appointment.service.name,
      priceCents: appointment.priceCents,
      durationMinutes: appointment.durationMinutes,
      hairInfo: appointment.hairInfo,
      comments: appointment.comments,
    })),
    assessments: customer.assessments.map((assessment) => ({
      id: assessment.id,
      createdAt: assessment.createdAt.toISOString(),
      status: assessment.status,
      serviceName: assessment.service.name,
      answers: assessment.answers,
      photoCount: assessment.photoKeys.length,
    })),
    customRequests: customer.customRequests.map((request) => ({
      id: request.id,
      createdAt: request.createdAt.toISOString(),
      status: request.status,
      description: request.description,
      decisionMessage: request.adminReply,
      estimatedPriceCents: request.estimatedPriceCents,
      photoCount: request.photoKeys.length,
    })),
    conversations: customer.conversations.map((conversation) => ({
      id: conversation.id,
      subject: conversation.subject,
      status: conversation.status,
      createdAt: conversation.createdAt.toISOString(),
      messages: conversation.messages.map((message) => ({
        author: message.author,
        content: message.content,
        sentAt: message.sentAt.toISOString(),
      })),
    })),
  };
}

export interface AnonymizationSummary {
  customerId: string;
  conversationsDeleted: number;
  assessmentsDeleted: number;
  customRequestsDeleted: number;
  photosDeleted: number;
}

export async function anonymizeCustomerData(id: string): Promise<AnonymizationSummary | null> {
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      assessments: { select: { photoKeys: true } },
      customRequests: { select: { photoKeys: true } },
      _count: { select: { assessments: true, customRequests: true, conversations: true } },
    },
  });
  if (!customer) return null;

  const photoKeys = [
    ...customer.assessments.flatMap((assessment) => assessment.photoKeys),
    ...customer.customRequests.flatMap((request) => request.photoKeys),
  ];
  await deletePrivateImages(photoKeys);

  const anonymizedEmail = `deleted-${customer.id}@invalid.local`;

  await db.$transaction(async (tx) => {
    await tx.conversation.deleteMany({ where: { customerId: customer.id } });
    await tx.hairAssessment.deleteMany({ where: { customerId: customer.id } });
    await tx.customRequest.deleteMany({ where: { customerId: customer.id } });
    await tx.appointment.updateMany({
      where: { customerId: customer.id },
      data: {
        cancelToken: null,
        cancelTokenExpiresAt: null,
        hairInfo: Prisma.DbNull,
        comments: null,
        cancelReason: null,
      },
    });
    await tx.customer.update({
      where: { id: customer.id },
      data: { name: 'Cliente supprimée', email: anonymizedEmail, phone: '' },
    });
    await tx.auditLog.create({
      data: {
        action: 'customer.anonymize',
        entityType: 'Customer',
        entityId: customer.id,
        metadata: {
          conversationsDeleted: customer._count.conversations,
          assessmentsDeleted: customer._count.assessments,
          customRequestsDeleted: customer._count.customRequests,
          photosDeleted: photoKeys.length,
        },
      },
    });
  });

  return {
    customerId: customer.id,
    conversationsDeleted: customer._count.conversations,
    assessmentsDeleted: customer._count.assessments,
    customRequestsDeleted: customer._count.customRequests,
    photosDeleted: photoKeys.length,
  };
}
