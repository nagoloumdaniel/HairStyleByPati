'use client';

import { useActionState } from 'react';
import type { AdminService } from '@/lib/catalogue-admin';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import {
  adminArchiveService,
  adminSetServiceStatus,
  type CatalogueActionState,
} from '@/modules/catalogue/actions';

/* ============================================================
 * Actions rapides d'une ligne de prestation : changer le statut
 * ou archiver, sans quitter la liste (P4.1, P4.6).
 * ============================================================ */

export function ServiceActionsRow({ service }: { service: AdminService }) {
  const [statusState, statusFormAction, statusPending] = useActionState<
    CatalogueActionState,
    FormData
  >(adminSetServiceStatus, {});
  const [archiveState, archiveFormAction, archivePending] = useActionState<
    CatalogueActionState,
    FormData
  >(adminArchiveService, {});

  return (
    <div className="flex flex-col items-stretch gap-2 md:items-end">
      <form action={statusFormAction} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="id" value={service.id} />
        <div className="min-w-36">
          <Select
            label="Statut"
            name="status"
            defaultValue={service.status}
            id={`status-${service.id}`}
            options={[
              { value: 'DRAFT', label: 'Brouillon' },
              { value: 'PUBLISHED', label: 'Publié' },
              { value: 'ARCHIVED', label: 'Archivé' },
            ]}
          />
        </div>
        <Button type="submit" variant="secondary" size="sm" loading={statusPending}>
          Appliquer
        </Button>
      </form>

      {service.status !== 'ARCHIVED' ? (
        <form
          action={archiveFormAction}
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Archiver « ${service.name} » ? Elle disparaîtra du site public mais son historique est conservé.`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={service.id} />
          <Button type="submit" variant="ghost" size="sm" loading={archivePending}>
            Archiver
          </Button>
        </form>
      ) : null}

      {statusState.error || archiveState.error ? (
        <p role="alert" className="max-w-56 text-xs font-medium text-alert">
          {statusState.error ?? archiveState.error}
        </p>
      ) : null}
      {statusState.success || archiveState.success ? (
        <p role="status" className="max-w-56 text-xs font-medium text-success">
          {statusState.success ?? archiveState.success}
        </p>
      ) : null}
    </div>
  );
}
