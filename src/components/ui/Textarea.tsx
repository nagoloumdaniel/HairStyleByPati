import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Textarea({ label, error, hint, id, required, ...rest }: TextareaProps) {
  const inputId = id ?? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const describedBy = [error ? `${inputId}-error` : null, hint ? `${inputId}-hint` : null]
    .filter(Boolean)
    .join(' ');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-ink">
        {label}{' '}
        {required ? (
          <span aria-hidden="true" className="text-alert">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only">(obligatoire)</span> : null}
      </label>
      <textarea
        {...rest}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        rows={rest.rows ?? 4}
        className={`w-full rounded-[var(--radius-md)] border bg-surface px-4 py-2.5 text-ink placeholder:text-ink-soft/60 transition ${
          error ? 'border-alert' : 'border-cream-dark focus:border-cacao'
        }`}
      />
      {hint && !error ? (
        <p id={`${inputId}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-sm font-medium text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
