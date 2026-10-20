import type { ReactNode } from 'react';

/* Habillage commun des champs : libellé, astérisque, aide, erreur. */
export function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-fg">
        {label}{' '}
        {required ? (
          <span aria-hidden="true" className="text-alert">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only">(obligatoire)</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const fieldBox = (error?: string) =>
  `w-full rounded-[var(--radius-md)] border bg-card px-4 py-2.5 text-fg transition ${
    error ? 'border-alert' : 'border-line focus:border-cacao'
  }`;
