import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { db } from '@/lib/db';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'Liste d’attente - Tableau de bord' };

const STATUS_LABELS: Record<string, { label: string; tone: 'success' | 'alert' | 'neutral' }> = {
  WAITING: { label: 'En attente', tone: 'neutral' },
  NOTIFIED: { label: 'Prévenue', tone: 'neutral' },
  CONFIRMED: { label: 'Confirmée', tone: 'success' },
  EXPIRED: { label: 'Expirée', tone: 'alert' },
  CANCELLED: { label: 'Annulée', tone: 'alert' },
};

export default async function WaitlistPage() {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/liste-attente');

  const entries = await db.waitlistEntry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { service: { select: { name: true } } },
  });

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-semibold">Liste d’attente</h1>
        <p className="mt-1 text-ink-soft">
          Clientes prévenues automatiquement par e-mail quand leur créneau se libère (hors v1
          initial, §19). La confirmation reste manuelle : la cliente doit réserver elle-même via le
          lien reçu, avec re-vérification complète de la disponibilité.
        </p>
      </div>
      <ul className="mt-5 flex flex-col gap-2">
        {entries.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-dashed border-line p-8 text-center text-muted">
            Aucune demande de liste d’attente.
          </p>
        ) : (
          entries.map((entry) => {
            const status = STATUS_LABELS[entry.status] ?? {
              label: entry.status,
              tone: 'neutral' as const,
            };
            return (
              <li
                key={entry.id}
                className="rounded-[var(--radius-md)] border border-line bg-card p-4"
              >
                <p className="flex items-center gap-2 font-semibold text-fg">
                  {entry.customerName} · {entry.service.name}
                  <Badge tone={status.tone}>{status.label}</Badge>
                </p>
                <p className="text-sm text-muted">
                  {entry.customerEmail} · {entry.customerPhone}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Créneau souhaité : <LocalDateTime iso={entry.desiredStartsAt.toISOString()} />
                </p>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
