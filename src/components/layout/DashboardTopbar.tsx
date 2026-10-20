import { Bell, ExternalLink, LogOut, MessageSquare, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/modules/auth/actions';
import { Logo } from '@/components/shared/Logo';

/* Barre du haut du dashboard : messages, notifications, site public, déconnexion.
   Icônes seules (libellé en infobulle / lecteur d'écran) ; libellé visible dès xl. */
const ACTION =
  'relative inline-flex size-10 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-line bg-card text-sm font-semibold text-fg shadow-soft transition hover:border-cacao xl:w-auto xl:px-3.5';

function IconLink({
  href,
  label,
  icon: Icon,
  badge = 0,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}) {
  return (
    <Link href={href} aria-label={label} title={label} className={ACTION}>
      <Icon aria-hidden="true" className="size-[18px]" />
      <span className="hidden xl:inline">{label}</span>
      {badge > 0 ? (
        <span
          aria-label={`${badge} non lu${badge > 1 ? 's' : ''}`}
          className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-fg"
        >
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  );
}

export function DashboardTopbar({
  unreadMessages = 0,
  unreadNotifications = 0,
}: {
  unreadMessages?: number;
  unreadNotifications?: number;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-line bg-page/90 px-3 backdrop-blur sm:px-5 lg:px-6">
      <Link
        href="/dashboard"
        aria-label="Hairstyle by Patricia — accueil administration"
        className="flex items-center gap-2 lg:invisible"
      >
        <Logo markClassName="h-7 w-auto text-fg" showWordmark={false} />
        <span className="font-heading text-sm font-bold sm:hidden">Hairstyle by Patricia</span>
      </Link>
      <nav aria-label="Actions rapides" className="flex items-center gap-2">
        <IconLink
          href="/dashboard/messages"
          label="Messages"
          icon={MessageSquare}
          badge={unreadMessages}
        />
        <IconLink
          href="/dashboard/notifications"
          label="Notifications"
          icon={Bell}
          badge={unreadNotifications}
        />
        <IconLink href="/" label="Voir le site" icon={ExternalLink} />
        <form action={logout}>
          <button
            type="submit"
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className={ACTION}
          >
            <LogOut aria-hidden="true" className="size-[18px]" />
            <span className="hidden xl:inline">Déconnexion</span>
          </button>
        </form>
      </nav>
    </header>
  );
}
