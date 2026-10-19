import type { ReactNode } from 'react';

type BadgeTone = 'accent' | 'success' | 'alert' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  accent: 'bg-accent-soft text-ink',
  success: 'bg-success-soft text-success',
  alert: 'bg-alert-soft text-alert',
  neutral: 'bg-cream-dark text-ink-soft',
};

/* P2.3 + P2.9 : statut toujours en texte, jamais couleur seule. */
export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
