import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const VARIANTS: Record<ButtonVariant, string> = {
  // P2.3 : primaire jaune dore, texte ink (#191919) pour contraste AAA ~10.9:1.
  // Ne JAMAIS mettre de texte blanc sur accent (1.6:1).
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover shadow-soft',
  secondary: 'bg-card text-fg border border-line hover:border-cacao shadow-soft',
  ghost: 'bg-transparent text-cacao hover:bg-accent-soft',
  danger: 'bg-alert text-alert-fg hover:brightness-95',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-sm)]',
  md: 'px-5 py-2.5 text-base rounded-[var(--radius-md)]',
  lg: 'px-7 py-3.5 text-lg rounded-[var(--radius-md)]',
};

/* P2.3 + P2.9 : bouton accessible, anneau focus via CSS global, etat chargement annonce. */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}
