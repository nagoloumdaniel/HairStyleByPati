import type { Prisma } from '@prisma/client';
import type { SalonSettingsData } from '@/modules/disponibilites/queries';

/* ============================================================
 * Notifications de réservation (outbox P7)
 * Les lignes sont créées dans la même transaction que le rendez-vous.
 * L'envoi réel (e-mail) arrive en phase 7 : idempotence garantie ici.
 * ============================================================ */

export type AppointmentNotificationEvent =
  | 'created'
  | 'confirmed'
  | 'cancelled_by_customer'
  | 'cancelled_by_admin'
  | 'rescheduled'
  | 'completed'
  | 'no_show';

const CLIENT_TEMPLATES: Record<AppointmentNotificationEvent, string | null> = {
  created: 'booking_received',
  confirmed: 'booking_confirmed',
  cancelled_by_customer: 'booking_cancelled_customer',
  cancelled_by_admin: 'booking_cancelled_admin',
  rescheduled: 'booking_rescheduled',
  completed: null,
  no_show: null,
};

const ADMIN_TEMPLATES: Partial<Record<AppointmentNotificationEvent, string>> = {
  created: 'admin_new_booking',
  cancelled_by_customer: 'admin_booking_cancelled',
  rescheduled: 'admin_booking_rescheduled',
};

export interface NotificationContext {
  appointmentId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  cancelToken?: string | null;
  reason?: string | null;
  settings: Pick<SalonSettingsData, 'contactEmail'>;
  idempotencySuffix?: string;
}

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export async function queueAppointmentNotifications(
  tx: Prisma.TransactionClient,
  event: AppointmentNotificationEvent,
  context: NotificationContext,
): Promise<void> {
  const suffix = context.idempotencySuffix ?? context.status;
  const payload = {
    appointmentId: context.appointmentId,
    customerName: context.customerName,
    customerEmail: context.customerEmail,
    customerPhone: context.customerPhone,
    serviceName: context.serviceName,
    startsAt: context.startsAt.toISOString(),
    endsAt: context.endsAt.toISOString(),
    status: context.status,
    reason: context.reason ?? null,
    cancelUrl: context.cancelToken ? `${appBaseUrl()}/annulation/${context.cancelToken}` : null,
  } as Prisma.InputJsonValue;

  const rows: Prisma.NotificationCreateManyInput[] = [];
  const clientTemplate = CLIENT_TEMPLATES[event];
  if (clientTemplate) {
    rows.push({
      idempotencyKey: `appointment:${context.appointmentId}:${event}:client:${suffix}`,
      recipient: context.customerEmail,
      templateKey: clientTemplate,
      payload,
    });
  }

  const adminTemplate = ADMIN_TEMPLATES[event];
  const adminEmail = context.settings.contactEmail ?? process.env.ADMIN_EMAIL ?? null;
  if (adminTemplate && adminEmail) {
    rows.push({
      idempotencyKey: `appointment:${context.appointmentId}:${event}:admin:${suffix}`,
      recipient: adminEmail,
      templateKey: adminTemplate,
      payload,
    });
  }

  if (rows.length === 0) return;
  await tx.notification.createMany({ data: rows, skipDuplicates: true });
}
