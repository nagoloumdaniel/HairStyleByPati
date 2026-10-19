import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import {
  CONVERSATION_SOURCE_LABELS,
  CONVERSATION_STATUS_LABELS,
  CONVERSATION_STATUS_TONES,
  getConversationAdmin,
} from '@/modules/messagerie/queries';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ConversationReadMarker } from '../conversation-read-marker';
import { MessageActions } from '../message-actions';

export const metadata: Metadata = { title: 'Conversation - Tableau de bord' };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  if (!user) redirect(`/connexion?callbackUrl=/dashboard/messages/${id}`);

  const conversation = await getConversationAdmin(id);
  if (!conversation) notFound();

  return (
    <div className="p-6">
      <nav aria-label="Fil d'Ariane" className="text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/dashboard/messages" className="transition hover:text-cacao">
              Messages
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-medium text-fg">
              {conversation.subject}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{conversation.subject}</h1>
            <Badge tone={CONVERSATION_STATUS_TONES[conversation.status]}>
              {CONVERSATION_STATUS_LABELS[conversation.status]}
            </Badge>
            <Badge tone="neutral">{CONVERSATION_SOURCE_LABELS[conversation.source]}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            {conversation.customerName}
            {conversation.customerPhone ? ` · ${conversation.customerPhone}` : ''}
            {conversation.customerEmail ? (
              <>
                {' · '}
                <a
                  href={`mailto:${conversation.customerEmail}`}
                  className="text-cacao underline-offset-4 hover:underline"
                >
                  {conversation.customerEmail}
                </a>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Échanges</h2>
          <ol className="mt-4 flex flex-col gap-3">
            {conversation.messages.map((message) => {
              const isCustomer = message.author === 'CUSTOMER';
              return (
                <li
                  key={message.id}
                  className={`rounded-[var(--radius-md)] border p-3 ${
                    message.isInternal
                      ? 'border-alert/40 bg-alert-soft'
                      : isCustomer
                        ? 'border-line bg-page'
                        : 'border-cacao/30 bg-card'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
                    <span className="font-semibold">
                      {message.isInternal
                        ? 'Note interne (Patricia)'
                        : isCustomer
                          ? conversation.customerName
                          : message.author === 'ADMIN'
                            ? 'Patricia'
                            : 'Système'}
                    </span>
                    <span>
                      <LocalDateTime iso={message.sentAt.toISOString()} />
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-fg">{message.content}</p>
                  {message.isInternal ? (
                    <p className="mt-2 text-xs font-semibold text-alert">
                      Visible uniquement dans le dashboard
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="space-y-6">
          <Card className="text-sm">
            <h2 className="font-heading text-xl font-bold text-fg">Coordonnées</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-semibold">Nom</dt>
                <dd className="text-ink-soft">{conversation.customerName}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-semibold">E-mail</dt>
                <dd className="text-ink-soft">{conversation.customerEmail ?? 'Non renseigné'}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-semibold">Téléphone</dt>
                <dd className="text-ink-soft">{conversation.customerPhone ?? 'Non renseigné'}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-semibold">Dernier message</dt>
                <dd className="text-ink-soft">
                  <LocalDateTime iso={conversation.lastMessageAt.toISOString()} />
                </dd>
              </div>
            </dl>
          </Card>

          <MessageActions conversationId={conversation.id} status={conversation.status} />
        </div>
      </div>
      <ConversationReadMarker conversationId={conversation.id} />
    </div>
  );
}
