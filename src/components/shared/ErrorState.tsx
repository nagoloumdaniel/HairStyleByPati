/* P2.7 : erreur claire, explique quoi faire, jamais d'excuse vague. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-[var(--radius-lg)] border border-alert bg-alert-soft px-6 py-8 text-center"
    >
      <h2 className="text-lg font-semibold text-alert">Un probleme est survenu</h2>
      <p className="mt-2 text-fg">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-[var(--radius-md)] bg-alert px-5 py-2.5 font-semibold text-alert-fg transition hover:brightness-95"
        >
          Reessayer
        </button>
      ) : null}
    </div>
  );
}
