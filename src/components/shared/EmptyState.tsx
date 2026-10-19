import Link from 'next/link';
import { Button } from '@/components/ui/Button';

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
      <h2 className="mt-4 text-xl font-heading font-bold text-fg">{title}</h2>
      <p className="mt-2 max-w-md text-muted">{message}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-5 py-2.5 font-semibold text-accent-fg shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
