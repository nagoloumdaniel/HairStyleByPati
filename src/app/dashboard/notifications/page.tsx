import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import {
  listAdminNotifications,
  listFailedEmails,
  notificationDeliveryStats,
} from '@/modules/notifications/queries';
import {
  markAllNotificationsReadForm,
  markNotificationReadForm,
  retryNotificationForm,
} from '@/modules/notifications/actions';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/shared/EmptyState';

export const metadata: Metadata = { title: 'Notifications - Tableau de bord' };

const FILTERS = [
  { value: 'all', label: 'Notifications' },
  { value: 'unread', label: 'Non lues' },
  { value: 'failed', label: 'Échecs e-mail' },
] as const;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/notifications');

  const params = await searchParams;
  const filter = (['all', 'unread', 'failed'] as const).includes(
    first(params.filter) as 'all' | 'unread' | 'failed',
  )
    ? (first(params.filter) as 'all' | 'unread' | 'failed')
    : 'all';
  const rawPage = Number.parseInt(first(params.page), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const [result, failed, stats] = await Promise.all([
    listAdminNotifications({ filter, page }),
    listFailedEmails(),
    notificationDeliveryStats(),
  ]);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="mt-1 text-ink-soft">
            Messages du dashboard, e-mails envoyés et échecs d’envoi. Chaque notification renvoie
            vers la fiche concernée.
          </p>
        </div>
        <form action={markAllNotificationsReadForm}>
          <Button type="submit" variant="secondary" size="sm">
            Tout marquer comme lu
          </Button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <Badge tone="accent">En attente : {stats.pending}</Badge>
        <Badge tone="success">Envoyés : {stats.sent}</Badge>
        <Badge tone={stats.failed > 0 ? 'alert' : 'neutral'}>Échecs : {stats.failed}</Badge>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="navigation" aria-label="Filtres">
        {FILTERS.map((item) => (
          <Link
            key={item.value}
            href={
              item.value === 'all'
                ? '/dashboard/notifications'
                : `/dashboard/notifications?filter=${item.value}`
            }
            aria-current={filter === item.value ? 'page' : undefined}
            className={`rounded-[var(--radius-full)] border px-4 py-1.5 text-sm font-semibold transition ${
              filter === item.value
                ? 'border-cacao bg-cacao text-cacao-fg'
                : 'border-line bg-card text-fg hover:border-cacao'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <Card className="mt-5 p-0">
        {result.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Aucune notification"
              message={
                filter === 'failed'
                  ? 'Aucun échec d’envoi. La file fonctionne normalement.'
                  : 'Les nouvelles réservations et les messages de contact apparaîtront ici.'
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {result.items.map((notification) => (
              <li
                key={notification.id}
                className={`flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between ${
                  notification.readAt ? '' : 'bg-accent-soft/40'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-full ${notification.readAt ? 'bg-line' : 'bg-accent'}`}
                    />
                    <p className="font-semibold text-fg">{notification.title}</p>
                    <Badge
                      tone={notification.templateKey.startsWith('admin') ? 'accent' : 'neutral'}
                    >
                      {notification.templateKey.includes('admin') ||
                      notification.templateKey === 'conversation_reply_sent'
                        ? 'Équipe'
                        : 'Cliente'}
                    </Badge>
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        className="text-sm font-semibold text-cacao underline-offset-4 hover:underline"
                      >
                        Ouvrir la fiche
                      </Link>
                    ) : null}
                  </div>
                  {notification.detail ? (
                    <p className="mt-1 text-sm text-ink-soft">{notification.detail}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-ink-soft">
                    <LocalDateTime iso={notification.createdAt.toISOString()} /> ·{' '}
                    {notification.channel === 'IN_APP' ? 'Dashboard' : 'E-mail'}
                  </p>
                </div>
                {!notification.readAt ? (
                  <form action={markNotificationReadForm}>
                    <input type="hidden" name="id" value={notification.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Marquer comme lu
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {result.totalPages > 1 ? (
        <nav aria-label="Pagination notifications" className="mt-4 flex justify-between text-sm">
          {result.page > 1 ? (
            <Link
              href={`/dashboard/notifications?filter=${filter}&page=${result.page - 1}`}
              className="font-semibold text-cacao hover:underline"
            >
              Précédent
            </Link>
          ) : (
            <span />
          )}
          <span className="text-ink-soft">
            Page {result.page} sur {result.totalPages}
          </span>
          {result.page < result.totalPages ? (
            <Link
              href={`/dashboard/notifications?filter=${filter}&page=${result.page + 1}`}
              className="font-semibold text-cacao hover:underline"
            >
              Suivant
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold text-fg">Derniers échecs d’envoi</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Un échec est réessayé automatiquement avec un délai progressif. Vous pouvez relancer
          manuellement après vérification.
        </p>
        {failed.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">Aucun échec à signaler.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {failed.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--radius-md)] border border-alert/40 bg-alert-soft p-3"
              >
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-alert">{item.title}</p>
                  <p className="text-ink-soft">
                    {item.recipient} · {item.attempts} tentative(s)
                  </p>
                  {item.error ? (
                    <p className="mt-1 break-words text-xs text-ink-soft">{item.error}</p>
                  ) : null}
                </div>
                <form action={retryNotificationForm}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button type="submit" variant="secondary" size="sm">
                    Relancer
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
