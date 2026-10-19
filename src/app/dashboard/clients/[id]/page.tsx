import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { getCustomerAdmin } from '@/modules/clients/queries';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_TONES } from '@/modules/reservations/status';
import { CONVERSATION_STATUS_LABELS } from '@/modules/messagerie/queries';
import { CUSTOM_REQUEST_STATUS_LABELS } from '@/modules/demandes/queries';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = { title: 'Fiche cliente - Tableau de bord' };

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  if (!user) redirect(`/connexion?callbackUrl=/dashboard/clients/${id}`);
  const customer = await getCustomerAdmin(id);
  if (!customer) notFound();

  return (
    <div className="p-6">
      <nav aria-label="Fil d'Ariane" className="text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/dashboard/clients" className="transition hover:text-cacao">
              Clientes
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-medium text-fg">
              {customer.name}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-3">
        <h1 className="text-2xl font-semibold">{customer.name}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          <a
            href={`mailto:${customer.email}`}
            className="text-cacao underline-offset-4 hover:underline"
          >
            {customer.email}
          </a>
          {customer.phone ? ` · ${customer.phone}` : ' · téléphone non renseigné'}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Rendez-vous', customer.appointments.length],
          ['Demandes', customer.customRequests.length],
          ['Évaluations', customer.assessments.length],
          ['Conversations', customer.conversations.length],
        ].map(([label, count]) => (
          <Card key={String(label)}>
            <p className="text-sm text-ink-soft">{label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-fg">{count}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Rendez-vous</h2>
          {customer.appointments.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Aucun rendez-vous.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {customer.appointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <div>
                    <Link
                      href={`/dashboard/reservations/${appointment.id}`}
                      className="text-sm font-semibold text-fg hover:text-cacao"
                    >
                      {appointment.serviceName}
                    </Link>
                    <p className="text-xs text-ink-soft">
                      <LocalDateTime iso={appointment.startsAt.toISOString()} />
                      {appointment.priceCents != null
                        ? ` · ${euroFormatter.format(appointment.priceCents / 100)}`
                        : ''}
                    </p>
                  </div>
                  <Badge tone={APPOINTMENT_STATUS_TONES[appointment.status as never] ?? 'neutral'}>
                    {APPOINTMENT_STATUS_LABELS[appointment.status as never] ?? appointment.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Demandes personnalisées</h2>
          {customer.customRequests.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Aucune demande.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {customer.customRequests.map((request) => (
                <li key={request.id} className="py-2">
                  <Link
                    href={`/dashboard/demandes/${request.id}`}
                    className="text-sm font-semibold text-fg hover:text-cacao"
                  >
                    {request.description.slice(0, 80)}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    {CUSTOM_REQUEST_STATUS_LABELS[request.status as never]} ·{' '}
                    <LocalDateTime iso={request.createdAt.toISOString()} />
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Évaluations capillaires</h2>
          {customer.assessments.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Aucune évaluation.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {customer.assessments.map((assessment) => (
                <li key={assessment.id} className="py-2">
                  <Link
                    href={`/dashboard/evaluations/${assessment.id}`}
                    className="text-sm font-semibold text-fg hover:text-cacao"
                  >
                    {assessment.serviceName}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    {assessment.status} · <LocalDateTime iso={assessment.createdAt.toISOString()} />
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Conversations</h2>
          {customer.conversations.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Aucune conversation.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {customer.conversations.map((conversation) => (
                <li
                  key={conversation.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <div>
                    <Link
                      href={`/dashboard/messages/${conversation.id}`}
                      className="text-sm font-semibold text-fg hover:text-cacao"
                    >
                      {conversation.subject}
                    </Link>
                    <p className="text-xs text-ink-soft">
                      {CONVERSATION_STATUS_LABELS[conversation.status as never]} ·{' '}
                      <LocalDateTime iso={conversation.lastMessageAt.toISOString()} />
                    </p>
                  </div>
                  {conversation.unreadCount > 0 ? (
                    <Badge tone="accent">{conversation.unreadCount} non lu(s)</Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="mt-6 text-xs text-ink-soft">
        Fiche créée le <LocalDateTime iso={customer.createdAt.toISOString()} />. Données capillaires
        conservées uniquement sur les rendez-vous et évaluations, pas sur la fiche cliente.
      </p>
    </div>
  );
}
