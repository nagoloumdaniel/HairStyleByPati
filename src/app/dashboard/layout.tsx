import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { DashboardThemeLock } from '@/components/layout/DashboardThemeLock';
import { DashboardTopbar } from '@/components/layout/DashboardTopbar';
import { MobileTabBar, Sidebar } from '@/components/layout/Sidebar';
import { Logo } from '@/components/shared/Logo';
import { ConfirmProvider } from '@/components/ui/Confirm';
import { countUnreadCustomerMessages } from '@/modules/messagerie/queries';
import { countUnreadNotifications } from '@/modules/notifications/queries';

/* Exécuté dans le HTML serveur avant le premier rendu : évite un flash sombre. */
const THEME_SCRIPT =
  "document.documentElement.setAttribute('data-theme','light');document.documentElement.style.colorScheme='light';";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/* Les compteurs de badges ne bloquent pas le rendu de la page : la barre s'affiche
   immédiatement (sans badges) puis se complète en streaming. */
async function TopbarWithCounts() {
  const [unreadMessages, unreadNotifications] = await Promise.all([
    countUnreadCustomerMessages().catch(() => 0),
    countUnreadNotifications().catch(() => 0),
  ]);
  return (
    <DashboardTopbar unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
  );
}

/* Coquille dashboard : thème unique (clair), sidebar sombre sur desktop,
   barre d'onglets fixe sur mobile. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <DashboardThemeLock />
      <div className="grid min-h-dvh w-full grid-cols-1 content-start lg:grid-cols-[232px_minmax(0,1fr)] lg:content-stretch">
        <aside className="hidden min-w-0 bg-ink p-3 text-panel-fg lg:sticky lg:top-0 lg:block lg:h-dvh lg:self-start lg:overflow-y-auto">
          <Link href="/dashboard" className="flex h-14 items-center gap-2 px-3">
            <Logo markClassName="h-7 w-auto text-panel-fg" showWordmark={false} />
            <span className="font-heading text-sm font-bold text-panel-fg">
              Hairstyle by Patricia
            </span>
          </Link>
          <Sidebar />
        </aside>
        <div className="min-w-0">
          <Suspense fallback={<DashboardTopbar />}>
            <TopbarWithCounts />
          </Suspense>
          <main className="px-3 pb-24 pt-3 sm:px-5 sm:pt-4 lg:px-6 lg:pb-8">{children}</main>
        </div>
      </div>
      <MobileTabBar />
    </ConfirmProvider>
  );
}
