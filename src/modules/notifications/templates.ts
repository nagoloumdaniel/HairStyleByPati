/* ============================================================
 * P7.3 : modèles d'e-mails transactionnels.
 * Textes français sobres, lien direct, aucune donnée sensible
 * au-delà de ce que le destinataire doit connaître.
 * ============================================================ */

export type NotificationTemplateKey =
  | 'booking_received'
  | 'booking_confirmed'
  | 'booking_cancelled_customer'
  | 'booking_cancelled_admin'
  | 'booking_rescheduled'
  | 'booking_reminder'
  | 'admin_new_booking'
  | 'admin_booking_cancelled'
  | 'admin_booking_rescheduled'
  | 'admin_contact_message'
  | 'contact_received'
  | 'conversation_reply';

export interface AppointmentEmailPayload {
  kind?: 'appointment';
  appointmentId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceName?: string;
  startsAt: string;
  endsAt?: string;
  status?: string;
  reason?: string | null;
  cancelUrl?: string | null;
}

export interface ConversationEmailPayload {
  kind?: 'conversation';
  conversationId?: string;
  customerName: string;
  customerEmail?: string;
  subject: string;
  message?: string;
  adminLink?: string | null;
}

export type EmailPayload = AppointmentEmailPayload | ConversationEmailPayload;

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const SALON_NAME = 'Hairstyle by Patricia';
const SALON_PHONE = process.env.ADMIN_PHONE?.trim();

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(iso: string | undefined): string {
  if (!iso) return 'date à confirmer';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'date à confirmer';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(date);
}

function isConversation(payload: EmailPayload): payload is ConversationEmailPayload {
  return typeof (payload as ConversationEmailPayload).subject === 'string';
}

interface LayoutInput {
  title: string;
  intro: string;
  rows?: Array<[string, string]>;
  paragraphs?: string[];
  ctaLabel?: string;
  ctaUrl?: string | null;
  note?: string;
}

function layout(input: LayoutInput): string {
  const rows = (input.rows ?? [])
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:6px 0;color:#6b5b4b;font-size:14px;vertical-align:top;width:38%">${escapeHtml(label)}</td>
          <td style="padding:6px 0;color:#191919;font-size:14px;font-weight:600">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join('');
  const paragraphs = (input.paragraphs ?? [])
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;color:#3f352c;font-size:15px;line-height:1.6">${escapeHtml(paragraph)}</p>`,
    )
    .join('');
  const cta =
    input.ctaLabel && input.ctaUrl
      ? `<p style="margin:22px 0"><a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;background:#f4c542;color:#191919;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">${escapeHtml(input.ctaLabel)}</a></p>`
      : '';
  const note = input.note
    ? `<p style="margin:18px 0 0;color:#6b5b4b;font-size:13px;line-height:1.5">${escapeHtml(input.note)}</p>`
    : '';

  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px 12px;background:#fff8e9;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #f0e2c6">
            <tr><td>
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#76513d;font-weight:700">${SALON_NAME}</p>
              <h1 style="margin:0 0 16px;font-family:Georgia,serif;color:#191919;font-size:24px;line-height:1.3">${escapeHtml(input.title)}</h1>
              <p style="margin:0 0 16px;color:#3f352c;font-size:15px;line-height:1.6">${escapeHtml(input.intro)}</p>
              ${rows ? `<table role="presentation" width="100%" style="border-top:1px solid #f0e2c6;border-bottom:1px solid #f0e2c6;margin:8px 0 18px">${rows}</table>` : ''}
              ${paragraphs}
              ${cta}
              ${note}
              <p style="margin:24px 0 0;border-top:1px solid #f0e2c6;padding-top:16px;color:#6b5b4b;font-size:12px;line-height:1.6">
                ${SALON_NAME}${SALON_PHONE ? ` · ${escapeHtml(SALON_PHONE)}` : ''}<br />
                Paiement sur place. Merci de votre confiance.
              </p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function appointmentRows(
  payload: AppointmentEmailPayload,
  admin: boolean,
): Array<[string, string]> {
  const rows: Array<[string, string]> = [];
  if (payload.customerName)
    rows.push([
      admin ? 'Cliente' : 'Prestation',
      admin ? payload.customerName : (payload.serviceName ?? 'Prestation'),
    ]);
  if (admin) {
    if (payload.serviceName) rows.push(['Prestation', payload.serviceName]);
    if (payload.customerEmail) rows.push(['E-mail', payload.customerEmail]);
    if (payload.customerPhone) rows.push(['Téléphone', payload.customerPhone]);
  }
  rows.push([admin ? 'Créneau' : 'Date et heure', formatDate(payload.startsAt)]);
  if (payload.reason) rows.push(['Motif', payload.reason]);
  return rows;
}

function renderAppointment(
  key: NotificationTemplateKey,
  payload: AppointmentEmailPayload,
): RenderedEmail {
  const admin = key.startsWith('admin_');
  const service = payload.serviceName ?? 'votre prestation';
  const customer = payload.customerName;
  const when = formatDate(payload.startsAt);
  const rows = appointmentRows(payload, admin);
  const appointmentLink = payload.appointmentId
    ? `${APP_URL}/dashboard/reservations/${payload.appointmentId}`
    : `${APP_URL}/dashboard/reservations`;

  switch (key) {
    case 'booking_received':
      return {
        subject: 'Votre demande de rendez-vous est enregistrée',
        html: layout({
          title: 'Votre rendez-vous est enregistré',
          intro: `Bonjour ${customer}, votre réservation pour ${service} a bien été enregistrée. Patricia confirmera votre créneau si nécessaire.`,
          rows,
          note: 'Paiement sur place. Vous recevrez une confirmation dès que le rendez-vous sera validé.',
        }),
        text: `Bonjour ${customer},\n\nVotre réservation pour ${service} est enregistrée.\nDate : ${when}\nPaiement sur place.\n\n${SALON_NAME}`,
      };
    case 'booking_confirmed':
      return {
        subject: 'Votre rendez-vous est confirmé',
        html: layout({
          title: 'Votre rendez-vous est confirmé',
          intro: `Bonjour ${customer}, votre rendez-vous pour ${service} est confirmé.`,
          rows,
          ctaLabel: 'Gérer ou annuler mon rendez-vous',
          ctaUrl: payload.cancelUrl ?? null,
          note: 'Paiement sur place. Conservez ce message pour retrouver votre rendez-vous.',
        }),
        text: `Bonjour ${customer},\n\nVotre rendez-vous pour ${service} est confirmé le ${when}.\nPaiement sur place.\n${payload.cancelUrl ? `Gérer mon rendez-vous : ${payload.cancelUrl}\n` : ''}\n${SALON_NAME}`,
      };
    case 'booking_cancelled_customer':
    case 'booking_cancelled_admin':
      return {
        subject: 'Votre rendez-vous est annulé',
        html: layout({
          title: 'Votre rendez-vous est annulé',
          intro: `Bonjour ${customer}, votre rendez-vous pour ${service} a été annulé${key === 'booking_cancelled_admin' ? ' par le salon' : ''}.`,
          rows,
          paragraphs: [
            'Le créneau a été libéré. Vous pouvez réserver un nouveau rendez-vous depuis le site.',
          ],
          ctaLabel: 'Réserver un nouveau créneau',
          ctaUrl: `${APP_URL}/reserver`,
        }),
        text: `Bonjour ${customer},\n\nVotre rendez-vous pour ${service} du ${when} a été annulé.\nVous pouvez réserver un nouveau créneau : ${APP_URL}/reserver\n\n${SALON_NAME}`,
      };
    case 'booking_rescheduled':
      return {
        subject: 'Votre rendez-vous est reprogrammé',
        html: layout({
          title: 'Votre rendez-vous est reprogrammé',
          intro: `Bonjour ${customer}, votre rendez-vous pour ${service} a été déplacé au nouveau créneau ci-dessous.`,
          rows,
          ctaLabel: 'Gérer ou annuler mon rendez-vous',
          ctaUrl: payload.cancelUrl ?? null,
          note: 'Paiement sur place.',
        }),
        text: `Bonjour ${customer},\n\nVotre rendez-vous pour ${service} est reprogrammé : ${when}.\nPaiement sur place.\n\n${SALON_NAME}`,
      };
    case 'booking_reminder':
      return {
        subject: 'Rappel : votre rendez-vous approche',
        html: layout({
          title: 'Votre rendez-vous approche',
          intro: `Bonjour ${customer}, un rappel pour votre rendez-vous pour ${service}.`,
          rows,
          ctaLabel: 'Voir mon rendez-vous',
          ctaUrl: payload.cancelUrl ?? `${APP_URL}/reserver`,
          note: 'Paiement sur place. En cas d’empêchement, utilisez le lien reçu avec votre confirmation.',
        }),
        text: `Bonjour ${customer},\n\nRappel : rendez-vous pour ${service} le ${when}.\nPaiement sur place.\n\n${SALON_NAME}`,
      };
    case 'admin_new_booking':
      return {
        subject: `Nouvelle réservation : ${customer}`,
        html: layout({
          title: 'Nouvelle réservation',
          intro: `${customer} vient de réserver ${service}.`,
          rows,
          ctaLabel: 'Ouvrir la fiche rendez-vous',
          ctaUrl: appointmentLink,
        }),
        text: `Nouvelle réservation de ${customer} pour ${service} le ${when}.\n\n${appointmentLink}`,
      };
    case 'admin_booking_cancelled':
      return {
        subject: `Annulation : ${customer}`,
        html: layout({
          title: 'Rendez-vous annulé',
          intro: `${customer} a annulé son rendez-vous pour ${service}.`,
          rows,
          ctaLabel: 'Ouvrir la fiche rendez-vous',
          ctaUrl: appointmentLink,
        }),
        text: `Annulation de ${customer} pour ${service} le ${when}.\n\n${appointmentLink}`,
      };
    case 'admin_booking_rescheduled':
      return {
        subject: `Reprogrammation : ${customer}`,
        html: layout({
          title: 'Rendez-vous reprogrammé',
          intro: `Le rendez-vous de ${customer} pour ${service} a été reprogrammé.`,
          rows,
          ctaLabel: 'Ouvrir la fiche rendez-vous',
          ctaUrl: appointmentLink,
        }),
        text: `Rendez-vous de ${customer} pour ${service} reprogrammé le ${when}.\n\n${appointmentLink}`,
      };
    default:
      return { subject: '', html: '', text: '' };
  }
}

function renderConversation(
  key: NotificationTemplateKey,
  payload: ConversationEmailPayload,
): RenderedEmail {
  const messageLink = payload.adminLink
    ? `${APP_URL}${payload.adminLink}`
    : `${APP_URL}/dashboard/messages`;
  if (key === 'admin_contact_message') {
    return {
      subject: `Nouveau message : ${payload.subject}`,
      html: layout({
        title: 'Nouveau message de contact',
        intro: `${payload.customerName} vous a envoyé un message.`,
        rows: [
          ['Sujet', payload.subject],
          ['E-mail', payload.customerEmail ?? 'non renseigné'],
        ],
        paragraphs: payload.message ? [payload.message] : [],
        ctaLabel: 'Répondre dans le dashboard',
        ctaUrl: messageLink,
      }),
      text: `Nouveau message de ${payload.customerName}.\nSujet : ${payload.subject}\n${payload.message ?? ''}\n\n${messageLink}`,
    };
  }
  if (key === 'contact_received') {
    return {
      subject: 'Votre message a bien été reçu',
      html: layout({
        title: 'Message bien reçu',
        intro: `Bonjour ${payload.customerName}, Patricia a bien reçu votre message et vous répondra personnellement.`,
        rows: [['Sujet', payload.subject]],
        note: 'Vous pouvez répondre directement à cet e-mail.',
      }),
      text: `Bonjour ${payload.customerName},\n\nVotre message « ${payload.subject} » a bien été reçu. Patricia vous répondra personnellement.\n\n${SALON_NAME}`,
    };
  }
  // conversation_reply
  return {
    subject: `Réponse à votre message : ${payload.subject}`,
    html: layout({
      title: 'Réponse de Patricia',
      intro: `Bonjour ${payload.customerName}, voici la réponse à votre message.`,
      paragraphs: payload.message ? [payload.message] : [],
      note: 'Vous pouvez répondre directement à cet e-mail.',
    }),
    text: `Bonjour ${payload.customerName},\n\n${payload.message ?? ''}\n\n${SALON_NAME}`,
  };
}

export function renderNotification(templateKey: string, payload: unknown): RenderedEmail | null {
  if (!payload || typeof payload !== 'object') return null;
  const key = templateKey as NotificationTemplateKey;
  if (isConversation(payload as EmailPayload)) {
    if (!['admin_contact_message', 'contact_received', 'conversation_reply'].includes(key)) {
      return null;
    }
    return renderConversation(key, payload as ConversationEmailPayload);
  }
  const appointmentKeys: NotificationTemplateKey[] = [
    'booking_received',
    'booking_confirmed',
    'booking_cancelled_customer',
    'booking_cancelled_admin',
    'booking_rescheduled',
    'booking_reminder',
    'admin_new_booking',
    'admin_booking_cancelled',
    'admin_booking_rescheduled',
  ];
  if (!appointmentKeys.includes(key)) return null;
  return renderAppointment(key, payload as AppointmentEmailPayload);
}

export function notificationTemplateExists(templateKey: string): boolean {
  return [
    'booking_received',
    'booking_confirmed',
    'booking_cancelled_customer',
    'booking_cancelled_admin',
    'booking_rescheduled',
    'booking_reminder',
    'admin_new_booking',
    'admin_booking_cancelled',
    'admin_booking_rescheduled',
    'admin_contact_message',
    'contact_received',
    'conversation_reply',
  ].includes(templateKey);
}
