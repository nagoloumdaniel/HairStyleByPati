import type { ReactNode } from 'react';

/* P2.3 : carte surface blanche, angles arrondis, ombre douce. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-lg)] bg-card p-6 shadow-soft ${className}`}>
      {children}
    </div>
  );
}
