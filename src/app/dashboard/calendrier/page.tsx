import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { CalendarClient } from './calendar-client';

export const metadata: Metadata = { title: 'Calendrier - Tableau de bord' };

export default async function CalendrierPage() {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/calendrier');

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Calendrier</h1>
        <p className="text-ink-soft">
          Vue jour, semaine, mois et liste des rendez-vous. Cliquez sur un rendez-vous pour ouvrir
          sa fiche.
        </p>
      </div>
      <div className="mt-6">
        <CalendarClient />
      </div>
    </div>
  );
}
