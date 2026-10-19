import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { getAdminServiceDetail, listAdminCategories } from '@/lib/catalogue-admin';
import { formatDuration, formatPrice } from '@/lib/catalogue';
import {
  getImageSignedUrl,
  getStorageConfigurationHint,
  isStorageConfigured,
} from '@/modules/fichiers/storage';
import { adminUpdateService } from '@/modules/catalogue/actions';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { ServiceForm } from '../../service-form';
import { ServiceHeaderActions } from './service-header-actions';
import { OptionsPanel } from './options-panel';
import { ImagesPanel } from './images-panel';
import { CompatibilityPanel } from './compatibility-panel';
import { QuestionsPanel } from './questions-panel';

export const metadata: Metadata = { title: 'Modifier une prestation - Tableau de bord' };

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
};

const STATUS_TONES: Record<string, 'accent' | 'success' | 'alert' | 'neutral'> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  ARCHIVED: 'alert',
};

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  if (!user) redirect(`/connexion?callbackUrl=/dashboard/catalogue/prestations/${id}`);

  const [service, categories] = await Promise.all([
    getAdminServiceDetail(id),
    listAdminCategories(),
  ]);
  if (!service) notFound();

  const images = await Promise.all(
    service.images.map(async (image) => ({
      ...image,
      url: await getImageSignedUrl(image.key),
    })),
  );
  const storageReady = isStorageConfigured();

  const informationPanel = (
    <div className="p-4">
      <ServiceForm
        action={adminUpdateService}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          active: category.active,
        }))}
        initial={service}
        submitLabel="Enregistrer les informations"
      />
    </div>
  );

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
              {service.name}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{service.name}</h1>
            <Badge tone={STATUS_TONES[service.status] ?? 'neutral'}>
              {STATUS_LABELS[service.status] ?? service.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            {service.categoryName} · {formatPrice(service)} ·{' '}
            {formatDuration(service.durationMinutes)} · /coiffures/{service.slug}
          </p>
          {service.appointmentCount > 0 ? (
            <p className="mt-2 text-sm text-muted">
              {service.appointmentCount} réservation{service.appointmentCount > 1 ? 's' : ''}{' '}
              rattachée{service.appointmentCount > 1 ? 's' : ''} : l’archivage est préféré à la
              suppression.
            </p>
          ) : null}
        </div>
        <ServiceHeaderActions service={service} canDelete={service.appointmentCount === 0} />
      </div>

      <p className="mt-3 text-sm">
        <Link
          href={`/dashboard/historique?entityId=${service.id}`}
          className="font-semibold text-cacao underline-offset-4 hover:underline"
        >
          Voir l’historique des modifications
        </Link>
      </p>

      <Card className="mt-6 p-0">
        <Tabs
          tabs={[
            { id: 'informations', label: 'Informations', content: informationPanel },
            {
              id: 'options',
              label: `Options (${service.options.length})`,
              content: <OptionsPanel serviceId={service.id} options={service.options} />,
            },
            {
              id: 'photos',
              label: `Photos (${service.images.length})`,
              content: (
                <ImagesPanel
                  serviceId={service.id}
                  images={images}
                  storageReady={storageReady}
                  storageHint={getStorageConfigurationHint()}
                />
              ),
            },
            {
              id: 'compatibilite',
              label: 'Compatibilité',
              content: <CompatibilityPanel serviceId={service.id} rule={service.compatibility} />,
            },
            {
              id: 'questions',
              label: `Questions (${service.questions.length})`,
              content: <QuestionsPanel serviceId={service.id} questions={service.questions} />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
