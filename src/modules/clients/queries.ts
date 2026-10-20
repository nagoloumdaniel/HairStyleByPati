import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

/* ============================================================
 * P8.3 : fiches clientes, historique et accès restreint au dashboard.
 * La minimisation reste appliquée : pas de données capillaires sur Customer.
 * ============================================================ */

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  appointmentCount: number;
  assessmentCount: number;
  customRequestCount: number;
  conversationCount: number;
}

export async function listCustomers(options?: { search?: string; page?: number }): Promise<{
  items: CustomerListItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = 20;
  const search = options?.search?.trim() ?? '';
  const where: Prisma.CustomerWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }
    : {};
  const [total, rows] = await Promise.all([
    db.customer.count({ where }),
    db.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            appointments: true,
            assessments: true,
            customRequests: true,
            conversations: true,
          },
        },
      },
    }),
  ]);
  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      createdAt: row.createdAt,
      appointmentCount: row._count.appointments,
      assessmentCount: row._count.assessments,
      customRequestCount: row._count.customRequests,
      conversationCount: row._count.conversations,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/* Nombre max. d'éléments liés affichés par rubrique sur la fiche (les totaux restent exacts). */
const DETAIL_LIMIT = 30;

export interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  counts: {
    appointments: number;
    assessments: number;
    customRequests: number;
    conversations: number;
  };
  appointments: Array<{
    id: string;
    startsAt: Date;
    status: string;
    serviceName: string;
    priceCents: number | null;
  }>;
  assessments: Array<{
    id: string;
    createdAt: Date;
    status: string;
    serviceName: string;
  }>;
  customRequests: Array<{
    id: string;
    createdAt: Date;
    status: string;
    description: string;
  }>;
  conversations: Array<{
    id: string;
    subject: string;
    status: string;
    lastMessageAt: Date;
    unreadCount: number;
  }>;
}

export async function getCustomerAdmin(id: string): Promise<CustomerDetail | null> {
  const row = await db.customer.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          appointments: true,
          assessments: true,
          customRequests: true,
          conversations: true,
        },
      },
      appointments: {
        orderBy: { startsAt: 'desc' },
        take: DETAIL_LIMIT,
        select: {
          id: true,
          startsAt: true,
          status: true,
          priceCents: true,
          service: { select: { name: true } },
        },
      },
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: DETAIL_LIMIT,
        select: { id: true, createdAt: true, status: true, service: { select: { name: true } } },
      },
      customRequests: {
        orderBy: { createdAt: 'desc' },
        take: DETAIL_LIMIT,
        select: { id: true, createdAt: true, status: true, description: true },
      },
      conversations: {
        orderBy: { lastMessageAt: 'desc' },
        take: DETAIL_LIMIT,
        select: {
          id: true,
          subject: true,
          status: true,
          lastMessageAt: true,
          _count: {
            select: {
              messages: { where: { author: 'CUSTOMER', isInternal: false, readAt: null } },
            },
          },
        },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    createdAt: row.createdAt,
    counts: {
      appointments: row._count.appointments,
      assessments: row._count.assessments,
      customRequests: row._count.customRequests,
      conversations: row._count.conversations,
    },
    appointments: row.appointments.map((appointment) => ({
      id: appointment.id,
      startsAt: appointment.startsAt,
      status: appointment.status,
      serviceName: appointment.service.name,
      priceCents: appointment.priceCents,
    })),
    assessments: row.assessments.map((assessment) => ({
      id: assessment.id,
      createdAt: assessment.createdAt,
      status: assessment.status,
      serviceName: assessment.service.name,
    })),
    customRequests: row.customRequests.map((request) => ({
      id: request.id,
      createdAt: request.createdAt,
      status: request.status,
      description: request.description.slice(0, 120),
    })),
    conversations: row.conversations.map((conversation) => ({
      id: conversation.id,
      subject: conversation.subject,
      status: conversation.status,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: conversation._count.messages,
    })),
  };
}
