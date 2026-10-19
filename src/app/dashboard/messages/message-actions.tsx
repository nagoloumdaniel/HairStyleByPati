'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { ConversationStatus } from '@prisma/client';
import {
  adminAddInternalNote,
  adminReplyToConversation,
  adminSetConversationStatus,
  type ConversationActionState,
} from '@/modules/messagerie/actions';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

/* P7.6 : réponse, note interne et statut d'une conversation. */
export function MessageActions({
  conversationId,
  status,
}: {
  conversationId: string;
  status: ConversationStatus;
}) {
  const router = useRouter();
  const replyRef = useRef<HTMLFormElement>(null);
  const noteRef = useRef<HTMLFormElement>(null);
  const [statusState, statusAction, statusPending] = useActionState<
    ConversationActionState,
    FormData
  >(adminSetConversationStatus, {});
  const [replyState, replyAction, replyPending] = useActionState<ConversationActionState, FormData>(
    adminReplyToConversation,
    {},
  );
  const [noteState, noteAction, notePending] = useActionState<ConversationActionState, FormData>(
    adminAddInternalNote,
    {},
  );

  useEffect(() => {
    if (statusState.success || replyState.success || noteState.success) router.refresh();
  }, [statusState.success, replyState.success, noteState.success, router]);

  useEffect(() => {
    if (replyState.success) replyRef.current?.reset();
  }, [replyState.success]);
  useEffect(() => {
    if (noteState.success) noteRef.current?.reset();
  }, [noteState.success]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[var(--radius-md)] border border-line p-4">
        <h2 className="font-semibold text-fg">Statut de la conversation</h2>
        <form action={statusAction} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="conversationId" value={conversationId} />
          <div className="w-56">
            <Select
              label="Statut"
              name="status"
              defaultValue={status}
              options={[
                { value: 'NEW', label: 'Nouveau' },
                { value: 'IN_PROGRESS', label: 'En cours' },
                { value: 'WAITING_RESPONSE', label: 'Attente réponse' },
                { value: 'TREATED', label: 'Traité' },
                { value: 'ARCHIVED', label: 'Archivé' },
              ]}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" loading={statusPending}>
            Appliquer
          </Button>
        </form>
        {statusState.error ? (
          <p role="alert" className="mt-2 text-sm text-alert">
            {statusState.error}
          </p>
        ) : null}
      </section>

      <section className="rounded-[var(--radius-md)] border border-line p-4">
        <h2 className="font-semibold text-fg">Répondre à la cliente</h2>
        <p className="mt-1 text-sm text-ink-soft">
          La réponse est ajoutée au fil et envoyée par e-mail, en file d’attente.
        </p>
        <form ref={replyRef} action={replyAction} className="mt-3 flex flex-col gap-3">
          <input type="hidden" name="conversationId" value={conversationId} />
          <Textarea
            label="Votre réponse"
            name="content"
            rows={4}
            required
            minLength={2}
            maxLength={5000}
          />
          <Button type="submit" size="sm" loading={replyPending} className="self-start">
            Envoyer la réponse
          </Button>
        </form>
        {replyState.error ? (
          <p role="alert" className="mt-2 text-sm text-alert">
            {replyState.error}
          </p>
        ) : null}
        {replyState.success ? (
          <p role="status" className="mt-2 text-sm text-success">
            {replyState.success}
          </p>
        ) : null}
      </section>

      <section className="rounded-[var(--radius-md)] border border-line bg-accent-soft/30 p-4">
        <h2 className="font-semibold text-fg">Note interne</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Visible uniquement dans le dashboard. Aucun e-mail n’est envoyé.
        </p>
        <form ref={noteRef} action={noteAction} className="mt-3 flex flex-col gap-3">
          <input type="hidden" name="conversationId" value={conversationId} />
          <Textarea
            label="Note privée"
            name="content"
            rows={3}
            required
            minLength={2}
            maxLength={3000}
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            loading={notePending}
            className="self-start"
          >
            Ajouter la note interne
          </Button>
        </form>
        {noteState.error ? (
          <p role="alert" className="mt-2 text-sm text-alert">
            {noteState.error}
          </p>
        ) : null}
        {noteState.success ? (
          <p role="status" className="mt-2 text-sm text-success">
            {noteState.success}
          </p>
        ) : null}
      </section>
    </div>
  );
}
