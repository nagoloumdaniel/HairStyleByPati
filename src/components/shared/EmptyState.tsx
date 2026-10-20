import { Button, ButtonLink } from '@/components/ui/Button';
import { Title } from '@/components/ui/Title';

/* P2.7 : etat vide = invitation a agir, ton conversationnel, un seul appel a l'action. */
export function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-lg)] bg-card px-6 py-12 text-center shadow-soft">
      <span
        aria-hidden="true"
        className="inline-flex size-12 items-center justify-center rounded-full bg-accent-soft text-cacao"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
        </svg>
      </span>
      <Title as="h2" className="mt-4">
        {title}
      </Title>
      <p className="mt-2 max-w-md text-muted">{message}</p>
      {actionLabel && actionHref ? (
        <ButtonLink href={actionHref} className="mt-6">
          {actionLabel}
        </ButtonLink>
      ) : null}
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
