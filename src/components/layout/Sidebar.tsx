import Link from 'next/link';

/* P2.6 : sidebar dashboard, identite sobre distincte du public (fond ink, accents or). */
const NAV = [
  { href: '/dashboard', label: 'Vue d’ensemble' },
  { href: '/dashboard/catalogue', label: 'Catalogue' },
  { href: '/dashboard/evaluations', label: 'Evaluations' },
  { href: '/dashboard/reservations', label: 'Reservations' },
  { href: '/dashboard/messages', label: 'Messages' },
  { href: '/dashboard/parametres', label: 'Parametres' },
];

export function Sidebar({ pathname }: { pathname?: string }) {
  return (
    <nav aria-label="Navigation administration" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-[var(--radius-md)] px-4 py-2.5 font-medium transition ${
              active
                ? 'bg-accent font-semibold text-ink'
                : 'text-cream/85 hover:bg-cream/10 hover:text-cream'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
