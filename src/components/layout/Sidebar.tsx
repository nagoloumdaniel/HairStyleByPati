import Link from 'next/link';

/* P2.6 : sidebar dashboard, identite sobre distincte du public (fond ink, accents or). */
const NAV = [
  { href: '/dashboard', label: 'Vue d’ensemble' },
  { href: '/dashboard/calendrier', label: 'Calendrier' },
  { href: '/dashboard/catalogue', label: 'Catalogue' },
  { href: '/dashboard/disponibilites', label: 'Disponibilites' },
  { href: '/dashboard/historique', label: 'Historique' },
  { href: '/dashboard/evaluations', label: 'Evaluations' },
  { href: '/dashboard/reservations', label: 'Reservations' },
  { href: '/dashboard/messages', label: 'Messages' },
  { href: '/dashboard/parametres', label: 'Parametres' },
];

export function Sidebar({ pathname }: { pathname?: string }) {
  return (
    <nav
      aria-label="Navigation administration"
      className="flex w-full min-w-0 flex-row gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {NAV.map((item) => {
        // Les sous-pages (fiche prestation, etc.) gardent l'entrée active.
        const active =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`whitespace-nowrap rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition lg:px-4 lg:py-2.5 lg:text-base ${
              active
                ? 'bg-accent font-semibold text-accent-fg'
                : 'text-panel-fg/85 hover:bg-panel-fg/10 hover:text-panel-fg'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
