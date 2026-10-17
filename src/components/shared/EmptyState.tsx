import { Button } from '@/components/ui/Button';

/* P2.7 : etat vide = invitation a agir, ton conversationnel, un seul appel a l'action. */
export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-lg)] bg-surface px-6 py-12 text-center shadow-soft">
      <p aria-hidden="true" className="text-4xl">
        ✂
      </p>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-ink-soft">{message}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
