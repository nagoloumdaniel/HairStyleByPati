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
  `h-10 w-full rounded-[var(--radius-md)] border bg-card px-3.5 text-sm text-fg transition ${
    error ? 'border-alert' : 'border-line focus:border-cacao'
  }`;

/** Libellé désignant une personne (« Nom et prénom », « Prénom »…). */
export function isPersonLabel(label: string): boolean {
  return /pr[ée]nom/i.test(label);
}

/** Libellé demandant explicitement le nom complet d'une personne. */
function isFullNameLabel(label: string): boolean {
  return /nom et pr[ée]nom/i.test(label);
}

/* Placeholder par défaut quand aucun n'est fourni : selon type/nom, sinon dérivé du libellé. */
export function autoPlaceholder(label: string, type?: string, name?: string): string {
  const n = name ?? '';
  if (type === 'email' || /mail/i.test(n)) return 'vous@exemple.com';
  if (type === 'tel' || /phone|tel/i.test(n)) return '+221 77 123 45 67';
  if (type === 'password') return 'Votre mot de passe';
  if (type === 'search') return 'Rechercher…';
  if (type === 'url') return 'https://';
  if (type === 'number') return /price|prix|amount|value|montant/i.test(n) ? 'Ex. 15000' : 'Ex. 0';
  // « Nom et prénom » seulement pour une vraie personne (champs dédiés ou libellé explicite) :
  // un `name` générique (prestation, catégorie, option…) reçoit un placeholder dérivé du libellé.
  if (/^(fullname|customerName|requesterName)$/i.test(n) || isFullNameLabel(label))
    return 'Votre nom et prénom';
  if (/subject|objet/i.test(n)) return 'Objet de votre message';
  const clean = label
    .replace(/\s*\((facultatif|obligatoire)\)\s*/gi, ' ')
    .replace(/\s*[*:]\s*$/, '')
    .trim();
  return clean ? `Saisir ${clean.charAt(0).toLowerCase()}${clean.slice(1)}` : 'Saisir…';
}
