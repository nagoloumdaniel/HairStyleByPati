import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import {
  CUSTOM_REQUEST_STATUS_LABELS,
  CUSTOM_REQUEST_STATUS_TONES,
  getCustomRequestAdmin,
  listPublishedServiceOptions,
} from '@/modules/demandes/queries';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CustomRequestDecisionForm } from './decision-form';

export const metadata: Metadata = { title: 'Demande personnalisée - Tableau de bord' };

const HAIR_LABELS: Record<string, string> = {
  SHORT: 'Courts',
  MEDIUM: 'Mi-longs',
  LONG: 'Longs',
  VERY_LONG: 'Très longs',
};

const ACTION_LABELS: Record<string, string> = {
  IN_REVIEW: 'Prise en charge',
  INFO_REQUESTED: 'Précisions demandées',
  QUOTED: 'Devis envoyé',
  ACCEPTED: 'Demande acceptée',
  REFUSED: 'Demande refusée',
  CLOSED: 'Demande clôturée',
};

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

export default async function CustomRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  if (!user) redirect(`/connexion?callbackUrl=/dashboard/demandes/${id}`);

  const [request, services] = await Promise.all([
    getCustomRequestAdmin(id),
    listPublishedServiceOptions(),
  ]);
  if (!request) notFound();

  return (
    <div className="p-6">
      <nav aria-label="Fil d'Ariane" className="text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/dashboard/demandes" className="transition hover:text-cacao">
              Demandes
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-medium text-fg">
              {request.requesterName}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">Demande de {request.requesterName}</h1>
        <Badge tone={CUSTOM_REQUEST_STATUS_TONES[request.status]}>
          {CUSTOM_REQUEST_STATUS_LABELS[request.status]}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Reçue le <LocalDateTime iso={request.createdAt.toISOString()} />
      </p>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <h2 className="font-heading text-xl font-bold text-fg">Demande</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-semibold">E-mail</dt>
                <dd className="text-ink-soft">{request.requesterEmail}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-semibold">Téléphone</dt>
                <dd className="text-ink-soft">{request.requesterPhone ?? 'Non renseigné'}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-semibold">Date souhaitée</dt>
                <dd className="text-ink-soft">
                  {request.desiredDate
                    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(
                        request.desiredDate,
                      )
                    : 'Non précisée'}
                </dd>
              </div>
              {request.hairInfo ? (
                <>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="font-semibold">Longueur</dt>
                    <dd className="text-ink-soft">
                      {HAIR_LABELS[String(request.hairInfo.length)] ?? 'Non précisée'}
                    </dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="font-semibold">Type de cheveux</dt>
                    <dd className="text-ink-soft">{String(request.hairInfo.type ?? '')}</dd>
                  </div>
                  {request.hairInfo.currentStyle ? (
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="font-semibold">Coiffure actuelle</dt>
                      <dd className="text-ink-soft">{String(request.hairInfo.currentStyle)}</dd>
                    </div>
                  ) : null}
                  {request.hairInfo.comment ? (
                    <div className="flex flex-wrap justify-between gap-2">
                      <dt className="font-semibold">Précisions</dt>
                      <dd className="text-ink-soft">{String(request.hairInfo.comment)}</dd>
                    </div>
                  ) : null}
                </>
              ) : null}
            </dl>
            <p className="mt-4 whitespace-pre-line rounded-[var(--radius-md)] bg-page p-3 text-sm text-fg">
              {request.description}
            </p>
          </Card>

          <Card>
            <h2 className="font-heading text-xl font-bold text-fg">Photos de référence</h2>
            {request.photos.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">Aucune photo transmise.</p>
            ) : (
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {request.photos.map((photo) => (
                  <li key={photo.key}>
                    {photo.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.url}
                        alt="Photo de référence de la demande"
                        className="aspect-square w-full rounded-[var(--radius-md)] object-cover"
                      />
                    ) : (
                      <p className="rounded-[var(--radius-md)] bg-page p-3 text-xs text-ink-soft">
                        Photo privée indisponible pour le moment.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="font-heading text-xl font-bold text-fg">Historique des décisions</h2>
            {request.decisions.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">Aucune décision enregistrée.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {request.decisions.map((decision) => (
                  <li
                    key={decision.id}
                    className="rounded-[var(--radius-md)] border border-line p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-fg">
                        {ACTION_LABELS[decision.action] ?? decision.action}
                      </p>
                      <p className="text-xs text-ink-soft">
                        <LocalDateTime iso={decision.createdAt.toISOString()} />
                        {decision.userName ? ` · ${decision.userName}` : ''}
                      </p>
                    </div>
                    {decision.message ? (
                      <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">
                        {decision.message}
                      </p>
                    ) : null}
                    {decision.priceCents != null ||
                    decision.proposedServiceName ||
                    decision.proposedSlot ? (
                      <p className="mt-2 text-xs text-ink-soft">
                        {decision.priceCents != null
                          ? `Prix : ${euroFormatter.format(decision.priceCents / 100)}`
                          : ''}
                        {decision.proposedServiceName
                          ? ` · Prestation : ${decision.proposedServiceName}`
                          : ''}
                        {decision.proposedSlot ? (
                          <>
                            {' · Créneau : '}
                            <LocalDateTime iso={decision.proposedSlot.toISOString()} />
                          </>
                        ) : null}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {request.adminReply ? (
            <Card>
              <h2 className="font-heading text-xl font-bold text-fg">Proposition actuelle</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-fg">{request.adminReply}</p>
              <p className="mt-2 text-sm text-ink-soft">
                {request.estimatedPriceCents != null
                  ? `Prix estimé : ${euroFormatter.format(request.estimatedPriceCents / 100)}`
                  : 'Prix non estimé'}
                {request.proposedService ? ` · ${request.proposedService.name}` : ''}
              </p>
              {request.proposedSlot ? (
                <p className="mt-1 text-sm text-ink-soft">
                  Créneau proposé : <LocalDateTime iso={request.proposedSlot.toISOString()} />
                </p>
              ) : null}
            </Card>
          ) : null}

          <Card>
            <h2 className="font-heading text-xl font-bold text-fg">Décider</h2>
            <p className="mt-1 text-sm text-ink-soft">
              La cliente reçoit le message par e-mail sauf pour une simple prise en charge.
            </p>
            <div className="mt-4">
              <CustomRequestDecisionForm
                requestId={request.id}
                services={services}
                currentStatus={request.status}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
