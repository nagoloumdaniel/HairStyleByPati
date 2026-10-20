import { MessageSquareText } from 'lucide-react';
import { autoPlaceholder } from './Field';
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
      <label htmlFor={inputId} className="text-sm font-semibold text-fg">
        {label}{' '}
        {required ? (
          <span aria-hidden="true" className="text-alert">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only">(obligatoire)</span> : null}
      </label>
      <div className="relative">
        <MessageSquareText
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-cacao"
        />
        <textarea
          {...rest}
          placeholder={rest.placeholder ?? autoPlaceholder(label, undefined, rest.name)}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          rows={rest.rows ?? 4}
          className={`w-full rounded-[var(--radius-md)] border bg-card py-2.5 pl-10 pr-4 text-fg placeholder:text-muted transition ${
            error ? 'border-alert' : 'border-line focus:border-cacao'
          }`}
        />
      </div>
      {hint && !error ? (
        <p id={`${inputId}-hint`} className="text-sm text-muted">
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
