import { Plus, Scissors } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { listAdminCategories } from '@/lib/catalogue-admin';
import { adminCreateService } from '@/modules/catalogue/actions';
import { PageHeader } from '@/components/layout/PageHeader';
import { BackButton } from '@/components/shared/BackButton';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ServiceForm } from '../../service-form';

export const metadata: Metadata = { title: 'Nouvelle prestation - Tableau de bord' };

export default async function NewServicePage() {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/catalogue/prestations/nouvelle');

  const categories = await listAdminCategories();

  return (
    <div>
      <PageHeader
        icon={Plus}
        title="Nouvelle prestation"
        description="Créez la fiche, puis ajoutez ses photos, options, règles de compatibilité et questions."
        back={<BackButton fallbackHref="/dashboard/catalogue" />}
      />

      {categories.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <Scissors aria-hidden="true" className="size-8 text-accent" />
          <div>
            <p className="font-semibold">Créez d&apos;abord une catégorie</p>
            <p className="mt-1 text-sm text-muted">
              Toute prestation appartient à une catégorie. Ajoutez-en une depuis le catalogue.
            </p>
          </div>
          <ButtonLink href="/dashboard/catalogue" icon={Scissors}>
            Gérer les catégories
          </ButtonLink>
        </Card>
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
  );
}
