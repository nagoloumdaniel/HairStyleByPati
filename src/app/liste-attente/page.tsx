import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { WaitlistForm } from './waitlist-form';

export const metadata: Metadata = {
  title: 'Liste d’attente - Hairstyle by Patricia',
  description: 'Soyez prévenue par e-mail si un créneau se libère pour la prestation souhaitée.',
};

export default async function ListeAttentePage() {
  const services = await db.service.findMany({
    where: { status: 'PUBLISHED', category: { active: true } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-fg">Liste d’attente</h1>
      <p className="mt-2 text-muted">
        Aucun créneau disponible à la date souhaitée ? Laissez vos coordonnées : vous serez prévenue
        par e-mail si ce créneau exact se libère. La confirmation reste à votre initiative, avec une
        nouvelle vérification complète de la disponibilité.
      </p>
      <div className="mt-8 rounded-[var(--radius-lg)] border border-line bg-card p-8 shadow-soft">
        <WaitlistForm services={services} />
      </div>
    </main>
  );
}
