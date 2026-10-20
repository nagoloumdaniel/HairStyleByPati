import type { ReactNode } from 'react';

/* Classes à poser sur le lien (ou bouton) principal : il couvre toute la carte ("stretched link"),
   sans imbriquer de <a>. Les actions secondaires restent cliquables (z-10). */
export const rowLinkClass =
  'after:absolute after:inset-0 after:rounded-[var(--radius-lg)] focus-visible:after:ring-2 focus-visible:after:ring-cacao';

/* Carte de liste entièrement cliquable + actions secondaires à droite. */
export function RowCard({
  children,
  actions,
  highlighted = false,
}: {
  children: ReactNode;
  actions?: ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative flex items-center gap-2 rounded-[var(--radius-lg)] border border-transparent p-3 shadow-soft transition hover:border-cacao hover:shadow-lift sm:p-4 ${
        highlighted ? 'bg-accent-soft/50' : 'bg-card'
      }`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {actions ? (
        <div className="relative z-10 flex shrink-0 items-center gap-1">{actions}</div>
      ) : null}
    </div>
  );
}

/* Pastille d'initiale. */
export function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-heading text-base font-bold text-accent"
    >
      {initial}
    </span>
  );
}
