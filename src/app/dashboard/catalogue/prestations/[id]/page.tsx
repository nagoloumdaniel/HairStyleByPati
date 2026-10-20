import { ExternalLink, History, Scissors } from 'lucide-react';
import type { Metadata } from 'next';
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
import { PageHeader } from '@/components/layout/PageHeader';
import { BackButton } from '@/components/shared/BackButton';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
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
      url: await getImageSignedUrl(image.key).catch(() => null),
    })),
  );
  const storageReady = isStorageConfigured();

  const informationPanel = (
    <Card>
      <ServiceForm
        action={adminUpdateService}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          active: category.active,
        }))}
        initial={service}
        submitLabel="Enregistrer"
      />
    </Card>
  );

  return (
    <div>
      <PageHeader
        icon={Scissors}
        title={service.name}
        back={<BackButton fallbackHref="/dashboard/catalogue" />}
        description={
          <>
            <Badge tone={STATUS_TONES[service.status] ?? 'neutral'} className="mr-2">
              {STATUS_LABELS[service.status] ?? service.status}
            </Badge>
            {service.categoryName} · {formatPrice(service)} ·{' '}
            {formatDuration(service.durationMinutes)}
          </>
        }
        actions={
          <>
            <ButtonLink
              href={`/dashboard/historique?entityId=${service.id}`}
              variant="ghost"
              icon={History}
              iconOnly="mobile"
            >
              Historique
            </ButtonLink>
            {service.status === 'PUBLISHED' ? (
              <ButtonLink
                href={`/coiffures/${service.slug}`}
                target="_blank"
                rel="noopener"
                variant="ghost"
                icon={ExternalLink}
                iconOnly="mobile"
              >
                Voir sur le site
              </ButtonLink>
            ) : null}
            <ServiceHeaderActions service={service} canDelete={service.appointmentCount === 0} />
          </>
        }
      />

      {service.appointmentCount > 0 ? (
        <p className="mb-3 rounded-[var(--radius-md)] bg-accent-soft px-3 py-2 text-sm">
          {service.appointmentCount} réservation{service.appointmentCount > 1 ? 's' : ''} rattachée
          {service.appointmentCount > 1 ? 's' : ''} : l’archivage est préféré à la suppression.
        </p>
      ) : null}

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
    </div>
  );
}
