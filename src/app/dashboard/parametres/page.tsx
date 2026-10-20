import { Settings } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { getSalonSettings } from '@/modules/disponibilites/queries';
import { Card } from '@/components/ui/Card';
import { SalonProfileForm } from './salon-profile-form';

export const metadata: Metadata = { title: 'Paramètres - Tableau de bord' };

export default async function SettingsPage() {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/parametres');
  const settings = await getSalonSettings();

  return (
    <div className="p-6">
      <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
        <Settings aria-hidden="true" className="size-6 text-accent" />
        Paramètres
      </h1>
      <p className="mt-1 text-ink-soft">
        Identité, coordonnées, horaires affichés et messages de politique. Les règles de créneaux et
        d’annulation se règlent dans{' '}
        <Link href="/dashboard/disponibilites" className="font-semibold text-cacao hover:underline">
          Disponibilités
        </Link>
        .
      </p>
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Identité et communication</h2>
          <div className="mt-4">
            <SalonProfileForm settings={settings} />
          </div>
        </Card>
        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Aperçu</h2>
          <p className="mt-3 font-heading text-2xl font-bold text-fg">{settings.name}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {settings.address ?? 'Adresse non renseignée'}
          </p>
          <p className="text-sm text-ink-soft">{settings.contactEmail ?? 'E-mail non renseigné'}</p>
          <p className="mt-4 text-sm text-ink-soft">
            Délai de rappel : {settings.reminderLeadHours} h · Annulation : au moins{' '}
            {settings.minCancelNoticeHours} h avant.
          </p>
          <p className="mt-4 text-xs text-ink-soft">
            Le logo et les horaires sont enregistrés dans les paramètres. Le logo n’est pas encore
            affiché automatiquement dans l’en-tête public.
          </p>
        </Card>
      </div>
    </div>
  );
}
