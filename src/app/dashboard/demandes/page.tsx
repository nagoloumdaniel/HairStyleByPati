import { Wand2 } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { CustomRequestStatus } from '@prisma/client';
import { requireAdmin } from '@/modules/auth/guards';
import {
  CUSTOM_REQUEST_STATUSES,
  CUSTOM_REQUEST_STATUS_LABELS,
  CUSTOM_REQUEST_STATUS_TONES,
  countCustomRequestsByStatus,
  listCustomRequests,
} from '@/modules/demandes/queries';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/shared/EmptyState';

export const metadata: Metadata = { title: 'Demandes personnalisées - Tableau de bord' };

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function CustomRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/demandes');

  const params = await searchParams;
  const rawStatus = first(params.status);
  const status = CUSTOM_REQUEST_STATUSES.includes(rawStatus as CustomRequestStatus)
    ? (rawStatus as CustomRequestStatus)
    : undefined;
  const rawPage = Number.parseInt(first(params.page), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const [counts, result] = await Promise.all([
    countCustomRequestsByStatus(),
    listCustomRequests({ status, page }),
  ]);

  const hrefFor = (nextStatus?: CustomRequestStatus) =>
    nextStatus ? `/dashboard/demandes?status=${nextStatus}` : '/dashboard/demandes';

  return (
    <div className="p-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
          <Wand2 aria-hidden="true" className="size-6 text-accent" />
          Demandes personnalisées
        </h1>
        <p className="mt-1 text-ink-soft">
          Coiffures hors catalogue, photos de référence et décisions. Une demande acceptée propose
          un créneau, sans jamais le réserver automatiquement.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="navigation" aria-label="Filtres demandes">
        <Link
          href={hrefFor()}
          aria-current={!status ? 'page' : undefined}
          className={`rounded-[var(--radius-full)] border px-4 py-1.5 text-sm font-semibold transition ${
            !status
              ? 'border-cacao bg-cacao text-cacao-fg'
              : 'border-line bg-card text-fg hover:border-cacao'
          }`}
        >
          Toutes ({Object.values(counts).reduce((sum, count) => sum + count, 0)})
        </Link>
        {CUSTOM_REQUEST_STATUSES.map((item) => (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={status === item ? 'page' : undefined}
            className={`rounded-[var(--radius-full)] border px-4 py-1.5 text-sm font-semibold transition ${
              status === item
                ? 'border-cacao bg-cacao text-cacao-fg'
                : 'border-line bg-card text-fg hover:border-cacao'
            }`}
          >
            {CUSTOM_REQUEST_STATUS_LABELS[item]} ({counts[item]})
          </Link>
        ))}
      </div>

      <Card className="mt-5 p-0">
        {result.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Aucune demande"
              message="Les demandes envoyées depuis la page sur mesure apparaîtront ici."
              actionLabel="Voir le formulaire public"
              actionHref="/demandes-personnalisees"
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {result.items.map((request) => (
              <li key={request.id}>
                <Link
                  href={`/dashboard/demandes/${request.id}`}
                  className="flex flex-col gap-2 p-4 transition hover:bg-page sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-fg">{request.requesterName}</p>
                      <Badge tone={CUSTOM_REQUEST_STATUS_TONES[request.status]}>
                        {CUSTOM_REQUEST_STATUS_LABELS[request.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{request.requesterEmail}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{request.description}</p>
                  </div>
                  <div className="shrink-0 text-xs text-ink-soft">
                    <p>
                      Reçue le <LocalDateTime iso={request.createdAt.toISOString()} />
                    </p>
                    {request.desiredDate ? (
                      <p className="mt-1">
                        Date souhaitée :{' '}
                        {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(
                          request.desiredDate,
                        )}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
