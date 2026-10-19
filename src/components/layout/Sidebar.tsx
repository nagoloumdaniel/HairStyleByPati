import Link from 'next/link';

/* P2.6 : sidebar dashboard, identite sobre distincte du public (fond ink, accents or). */
const NAV = [
  { href: '/dashboard', label: 'Vue d’ensemble', key: 'home' },
  { href: '/dashboard/calendrier', label: 'Calendrier', key: 'calendar' },
  { href: '/dashboard/catalogue', label: 'Catalogue', key: 'catalogue' },
  { href: '/dashboard/disponibilites', label: 'Disponibilites', key: 'availability' },
  { href: '/dashboard/historique', label: 'Historique', key: 'history' },
  { href: '/dashboard/evaluations', label: 'Evaluations', key: 'evaluations' },
  { href: '/dashboard/reservations', label: 'Reservations', key: 'reservations' },
  { href: '/dashboard/notifications', label: 'Notifications', key: 'notifications' },
  { href: '/dashboard/messages', label: 'Messages', key: 'messages' },
  { href: '/dashboard/parametres', label: 'Parametres', key: 'settings' },
] as const;

export function Sidebar({
  pathname,
  badges = {},
}: {
  pathname?: string;
  badges?: { messages?: number; notifications?: number };
}) {
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
        const badge =
          item.key === 'messages'
            ? badges.messages
            : item.key === 'notifications'
              ? badges.notifications
              : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center justify-between gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition lg:px-4 lg:py-2.5 lg:text-base ${
              active
                ? 'bg-accent font-semibold text-accent-fg'
                : 'text-panel-fg/85 hover:bg-panel-fg/10 hover:text-panel-fg'
            }`}
          >
            <span>{item.label}</span>
            {badge && badge > 0 ? (
              <span
                aria-label={`${badge} non lu${badge > 1 ? 's' : ''}`}
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  active ? 'bg-accent-fg text-accent' : 'bg-accent text-accent-fg'
                }`}
              >
                {badge > 99 ? '99+' : badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
