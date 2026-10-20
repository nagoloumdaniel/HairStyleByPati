import { Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { listCustomers } from '@/modules/clients/queries';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/shared/EmptyState';

export const metadata: Metadata = { title: 'Clientes - Tableau de bord' };

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/clients');

  const params = await searchParams;
  const search = first(params.q).slice(0, 100);
  const rawPage = Number.parseInt(first(params.page), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const result = await listCustomers({ search, page });

  const hrefFor = (nextPage: number) => {
    const query = new URLSearchParams();
    if (search) query.set('q', search);
    if (nextPage > 1) query.set('page', String(nextPage));
    const value = query.toString();
    return value ? `/dashboard/clients?${value}` : '/dashboard/clients';
  };

  return (
    <div className="p-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
          <Users aria-hidden="true" className="size-6 text-accent" />
          Clientes
        </h1>
        <p className="mt-1 text-ink-soft">
          Coordonnées, historique de rendez-vous, évaluations, demandes et conversations. Accès
          réservé à l’administration.
        </p>
      </div>

      <form
        method="get"
        action="/dashboard/clients"
        className="mt-5 flex flex-wrap items-end gap-3"
      >
        <div className="w-full max-w-sm">
          <label htmlFor="customer-search" className="text-sm font-semibold text-fg">
            Rechercher
          </label>
          <input
            id="customer-search"
            name="q"
            defaultValue={search}
            placeholder="Nom, e-mail ou téléphone"
            className="mt-1 w-full rounded-[var(--radius-md)] border border-line bg-card px-4 py-2.5 text-fg placeholder:text-muted"
          />
        </div>
        <Button type="submit" variant="secondary">
          Rechercher
        </Button>
        {search ? (
          <Link
            href="/dashboard/clients"
            className="text-sm font-semibold text-cacao hover:underline"
          >
            Réinitialiser
          </Link>
        ) : null}
      </form>

      <Card className="mt-5 p-0">
        {result.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Aucune cliente"
              message="Les fiches sont créées automatiquement lors d’une réservation, d’une demande ou d’un message."
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {result.items.map((customer) => (
              <li key={customer.id}>
                <Link
                  href={`/dashboard/clients/${customer.id}`}
                  className="flex flex-col gap-2 p-4 transition hover:bg-page sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-fg">{customer.name}</p>
                    <p className="text-sm text-ink-soft">
                      {customer.email} · {customer.phone || 'Téléphone non renseigné'}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {customer.appointmentCount} rendez-vous · {customer.customRequestCount}{' '}
                      demande(s) · {customer.assessmentCount} évaluation(s) ·{' '}
                      {customer.conversationCount} conversation(s)
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-ink-soft">
                    Créée le <LocalDateTime iso={customer.createdAt.toISOString()} />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {result.totalPages > 1 ? (
        <nav aria-label="Pagination des clientes" className="mt-4 flex justify-between text-sm">
          {result.page > 1 ? (
            <Link
              href={hrefFor(result.page - 1)}
              className="font-semibold text-cacao hover:underline"
            >
              Précédent
            </Link>
          ) : (
            <span />
          )}
          <span className="text-ink-soft">
            Page {result.page} sur {result.totalPages}
          </span>
          {result.page < result.totalPages ? (
            <Link
              href={hrefFor(result.page + 1)}
              className="font-semibold text-cacao hover:underline"
            >
              Suivant
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
