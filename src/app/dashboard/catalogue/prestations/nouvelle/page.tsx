import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { listAdminCategories } from '@/lib/catalogue-admin';
import { adminCreateService } from '@/modules/catalogue/actions';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { ServiceForm } from '../../service-form';

export const metadata: Metadata = { title: 'Nouvelle prestation - Tableau de bord' };

export default async function NewServicePage() {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/catalogue/prestations/nouvelle');

  const categories = await listAdminCategories();

  return (
    <div className="p-6">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/dashboard/catalogue" className="transition hover:text-cacao">
              Catalogue
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-medium text-fg">
              Nouvelle prestation
            </span>
          </li>
        </ol>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold">Nouvelle prestation</h1>
      <p className="mt-1 text-muted">
        Créez la fiche, puis ajoutez ses photos, options, règles de compatibilité et questions
        capillaires.
      </p>

      <div className="mt-6">
        {categories.length === 0 ? (
          <EmptyState
            title="Créez d'abord une catégorie"
            message="Toute prestation doit appartenir à une catégorie. Commencez par en créer une dans le catalogue."
            actionLabel="Gérer les catégories"
            actionHref="/dashboard/catalogue"
          />
        ) : (
          <Card>
            <ServiceForm
              action={adminCreateService}
              categories={categories.map((category) => ({
                id: category.id,
                name: category.name,
                active: category.active,
              }))}
              submitLabel="Créer la prestation"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
