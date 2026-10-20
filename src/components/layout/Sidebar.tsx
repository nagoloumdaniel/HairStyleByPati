import {
  Bell,
  CalendarDays,
  CalendarOff,
  ChartNoAxesColumn,
  ClipboardList,
  ExternalLink,
  Hourglass,
  Images,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Scissors,
  Settings,
  Star,
  Tag,
  Users,
  Wand2,
  History,
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

/* P2.6 : sidebar dashboard, identite sobre distincte du public (fond ink, accents or). */
const NAV = [
  { href: '/dashboard', label: 'Vue d’ensemble', key: 'home' },
  { href: '/dashboard/calendrier', label: 'Calendrier', key: 'calendar' },
  { href: '/dashboard/catalogue', label: 'Catalogue', key: 'catalogue' },
  { href: '/dashboard/disponibilites', label: 'Disponibilites', key: 'availability' },
  { href: '/dashboard/historique', label: 'Historique', key: 'history' },
  { href: '/dashboard/evaluations', label: 'Evaluations', key: 'evaluations' },
  { href: '/dashboard/reservations', label: 'Reservations', key: 'reservations' },
  { href: '/dashboard/demandes', label: 'Demandes', key: 'demandes' },
  { href: '/dashboard/clients', label: 'Clientes', key: 'clients' },
  { href: '/dashboard/liste-attente', label: 'Liste d’attente', key: 'waitlist' },
  { href: '/dashboard/avis', label: 'Avis', key: 'reviews' },
  { href: '/dashboard/galerie', label: 'Galerie', key: 'gallery' },
  { href: '/dashboard/promotions', label: 'Promotions', key: 'promotions' },
  { href: '/dashboard/notifications', label: 'Notifications', key: 'notifications' },
  { href: '/dashboard/messages', label: 'Messages', key: 'messages' },
  { href: '/dashboard/statistiques', label: 'Statistiques', key: 'stats' },
  { href: '/dashboard/parametres', label: 'Parametres', key: 'settings' },
] as const;

const ICONS: Record<(typeof NAV)[number]['key'], LucideIcon> = {
  home: LayoutDashboard,
  calendar: CalendarDays,
  catalogue: Scissors,
  availability: CalendarOff,
  history: History,
  evaluations: Star,
  reservations: ClipboardList,
  demandes: Wand2,
  clients: Users,
  waitlist: Hourglass,
  reviews: Star,
  gallery: Images,
  promotions: Tag,
  notifications: Bell,
  messages: MessageSquare,
  stats: ChartNoAxesColumn,
  settings: Settings,
};

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
        const Icon = ICONS[item.key];
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
            <span className="flex items-center gap-2.5">
              <Icon aria-hidden="true" className="size-4 shrink-0 lg:size-5" />
              {item.label}
            </span>
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
      <div className="flex items-center gap-1 lg:mt-3 lg:justify-between lg:border-t lg:border-panel-fg/15 lg:pt-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 whitespace-nowrap rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-panel-fg/85 transition hover:bg-panel-fg/10 hover:text-panel-fg lg:px-4 lg:text-base"
        >
          <ExternalLink aria-hidden="true" className="size-4 shrink-0 lg:size-5" />
          Voir le site
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
