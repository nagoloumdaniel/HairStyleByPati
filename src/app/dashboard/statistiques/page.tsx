import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { getStatistics } from '@/modules/stats/overview';
import { APPOINTMENT_STATUS_LABELS } from '@/modules/reservations/status';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = { title: 'Statistiques - Tableau de bord' };

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

export default async function StatisticsPage() {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/statistiques');
  const stats = await getStatistics();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Statistiques</h1>
      <p className="mt-1 text-ink-soft">
        Indicateurs de réservation et de demandes. Tous les montants sont estimés à partir des prix
        figés au moment de la réservation.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-ink-soft">Rendez-vous au total</p>
          <p className="mt-1 font-heading text-3xl font-bold text-fg">{stats.totalAppointments}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-soft">Prestations terminées</p>
          <p className="mt-1 font-heading text-3xl font-bold text-fg">
            {stats.byStatus.find((row) => row.status === 'COMPLETED')?.count ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-ink-soft">Revenus estimés</p>
          <p className="mt-1 font-heading text-3xl font-bold text-fg">
            {euroFormatter.format(stats.completedRevenueCents / 100)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-ink-soft">Ticket moyen terminé</p>
          <p className="mt-1 font-heading text-3xl font-bold text-fg">
            {euroFormatter.format(stats.averageTicketCents / 100)}
          </p>
        </Card>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Rendez-vous par statut</h2>
          <ul className="mt-3 divide-y divide-line">
            {stats.byStatus.map((row) => (
              <li key={row.status} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink-soft">
                  {APPOINTMENT_STATUS_LABELS[row.status as never] ?? row.status}
                </span>
                <span className="font-semibold text-fg">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Prestations populaires</h2>
          {stats.popularServices.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Aucune donnée de réservation.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {stats.popularServices.map((row) => (
                <li key={row.name} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-ink-soft">{row.name}</span>
                  <span className="font-semibold text-fg">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Demandes personnalisées</h2>
          <p className="mt-1 font-heading text-3xl font-bold text-fg">{stats.customRequests}</p>
          <Link
            href="/dashboard/demandes"
            className="mt-2 inline-block text-sm font-semibold text-cacao hover:underline"
          >
            Ouvrir la file des demandes
          </Link>
        </Card>

        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Définitions</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <strong className="text-fg">Revenus estimés :</strong> somme des prix figés des
              rendez-vous terminés, hors rendez-vous annulés ou absents.
            </li>
            <li>
              <strong className="text-fg">Ticket moyen :</strong> revenus estimés divisés par le
              nombre de rendez-vous terminés avec un prix.
            </li>
            <li>
              <strong className="text-fg">Prestations populaires :</strong> nombre de rendez-vous
              confirmés, reprogrammés ou terminés par prestation.
            </li>
            <li>
              <strong className="text-fg">Taux de remplissage :</strong> non calculé dans cette
              version, en attente d’une définition validée avec Patricia.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
