import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ConversationStatus } from '@prisma/client';
import { requireAdmin } from '@/modules/auth/guards';
import {
  CONVERSATION_SOURCE_LABELS,
  CONVERSATION_STATUSES,
  CONVERSATION_STATUS_LABELS,
  CONVERSATION_STATUS_TONES,
  countConversationsByStatus,
  listConversations,
} from '@/modules/messagerie/queries';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/shared/EmptyState';

export const metadata: Metadata = { title: 'Messages - Tableau de bord' };

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/messages');

  const params = await searchParams;
  const rawStatus = first(params.status);
  const status = CONVERSATION_STATUSES.includes(rawStatus as ConversationStatus)
    ? (rawStatus as ConversationStatus)
    : undefined;
  const rawPage = Number.parseInt(first(params.page), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const [counts, result] = await Promise.all([
    countConversationsByStatus(),
    listConversations({ status, page }),
  ]);

  const hrefFor = (nextStatus?: ConversationStatus, nextPage = 1) => {
    const query = new URLSearchParams();
    if (nextStatus) query.set('status', nextStatus);
    if (nextPage > 1) query.set('page', String(nextPage));
    const value = query.toString();
    return value ? `/dashboard/messages?${value}` : '/dashboard/messages';
  };

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="mt-1 text-ink-soft">
          Contacts, questions et échanges avec les clientes. Les notes internes restent privées.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="navigation" aria-label="Filtres messages">
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
        {CONVERSATION_STATUSES.map((item) => (
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
            {CONVERSATION_STATUS_LABELS[item]} ({counts[item]})
          </Link>
        ))}
      </div>

      <Card className="mt-5 p-0">
        {result.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Aucune conversation"
              message="Les messages envoyés depuis la page contact apparaîtront ici avec leur statut."
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {result.items.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  href={`/dashboard/messages/${conversation.id}`}
                  className="flex flex-col gap-3 p-4 transition hover:bg-page sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-fg">{conversation.subject}</p>
                      {conversation.unreadCount > 0 ? (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-fg">
                          {conversation.unreadCount} non lu{conversation.unreadCount > 1 ? 's' : ''}
                        </span>
                      ) : null}
                      <Badge tone={CONVERSATION_STATUS_TONES[conversation.status]}>
                        {CONVERSATION_STATUS_LABELS[conversation.status]}
                      </Badge>
                      <Badge tone="neutral">
                        {CONVERSATION_SOURCE_LABELS[conversation.source]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium text-ink-soft">
                      {conversation.customerName}
                      {conversation.customerEmail ? ` · ${conversation.customerEmail}` : ''}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-ink-soft">
                    <LocalDateTime iso={conversation.lastMessageAt.toISOString()} />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {result.totalPages > 1 ? (
        <nav aria-label="Pagination des messages" className="mt-4 flex justify-between text-sm">
          {result.page > 1 ? (
            <Link
              href={hrefFor(status, result.page - 1)}
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
              href={hrefFor(status, result.page + 1)}
              className="font-semibold text-cacao hover:underline"
            >
              Suivant
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
