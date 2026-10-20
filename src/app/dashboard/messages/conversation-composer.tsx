'use client';

import { CornerUpLeft, Lock, Send } from 'lucide-react';
import { useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from 'react';
import { adminAddInternalNote, adminReplyToConversation } from '@/modules/messagerie/actions';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

type Mode = 'reply' | 'note';

const MAX_HEIGHT = 160;

/* Zone de saisie collée en bas (au-dessus de la barre d'onglets mobile).
   Réponse = ajoutée au fil + e-mail ; note interne = visible uniquement ici. Ctrl/Cmd + Entrée envoie. */
export function ConversationComposer({
  conversationId,
  customerEmail,
}: {
  conversationId: string;
  customerEmail: string | null;
}) {
  const { notify } = useToast();
  const [mode, setMode] = useState<Mode>(customerEmail ? 'reply' : 'note');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const sendingRef = useRef(false);

  const isReply = mode === 'reply';
  const Icon = isReply ? CornerUpLeft : Lock;
  const limit = isReply ? 5000 : 3000;

  function grow() {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    // Garde anti double envoi (Ctrl+Entrée répété = 2 e-mails) : la ref couvre le rendu où `pending` est encore faux.
    if (pending || sendingRef.current) return;
    const content = text.trim();
    if (content.length < 2) {
      setError('Écrivez au moins 2 caractères.');
      return;
    }
    setError('');
    sendingRef.current = true;
    const data = new FormData();
    data.set('conversationId', conversationId);
    data.set('content', content);
    startTransition(async () => {
      try {
        const result = await (isReply ? adminReplyToConversation : adminAddInternalNote)({}, data);
        if (result.error) {
          setError(result.error);
          notify(result.error, 'error');
          return;
        }
        notify(result.success ?? 'Enregistré.', 'success');
        setText('');
        requestAnimationFrame(grow);
      } catch {
        const message = 'Envoi impossible. Vérifiez votre connexion et réessayez.';
        setError(message);
        notify(message, 'error');
      } finally {
        sendingRef.current = false;
      }
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) submit();
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Écrire dans la conversation"
      className="sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-20 -mx-3 mt-4 border-t border-line bg-page/95 px-3 py-2 backdrop-blur sm:mx-0 sm:rounded-[var(--radius-lg)] sm:border sm:bg-card sm:p-3 sm:shadow-soft lg:bottom-3"
    >
      <div className="mb-2 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          icon={CornerUpLeft}
          variant={isReply ? 'primary' : 'secondary'}
          aria-pressed={isReply}
          disabled={!customerEmail}
          onClick={() => setMode('reply')}
        >
          Répondre
        </Button>
        <Button
          type="button"
          size="sm"
          icon={Lock}
          variant={!isReply ? 'primary' : 'secondary'}
          aria-pressed={!isReply}
          onClick={() => setMode('note')}
        >
          Note interne
        </Button>
      </div>

      <div className="flex items-end gap-2">
        <div className="relative min-w-0 flex-1">
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-3 size-4 text-cacao"
          />
          <textarea
            ref={areaRef}
            value={text}
            rows={1}
            maxLength={limit}
            aria-label={isReply ? 'Votre réponse à la cliente' : 'Votre note interne'}
            aria-invalid={error ? true : undefined}
            aria-describedby="composer-hint"
            placeholder={isReply ? 'Écrire une réponse…' : 'Écrire une note privée…'}
            onChange={(event) => {
              setText(event.target.value);
              grow();
            }}
            onKeyDown={onKeyDown}
            className={`max-h-40 min-h-10 w-full resize-none rounded-[var(--radius-md)] border bg-card py-2.5 pl-10 pr-3 text-sm text-fg placeholder:text-muted ${
              error ? 'border-alert' : 'border-line focus:border-cacao'
            }`}
          />
        </div>
        <Button
          type="submit"
          icon={Send}
          iconOnly="mobile"
          loading={pending}
          disabled={pending || text.trim().length === 0}
        >
          {isReply ? 'Envoyer' : 'Ajouter la note'}
        </Button>
      </div>

      <p
        id="composer-hint"
        role={error ? 'alert' : undefined}
        className={`mt-1 text-xs ${error ? 'font-medium text-alert' : 'text-muted'}`}
      >
        {error ||
          (isReply
            ? `Envoyée par e-mail à ${customerEmail ?? 'la cliente'}.`
            : 'Visible uniquement dans le dashboard, aucun e-mail.')}
      </p>
    </form>
  );
}
