'use client';

import { useActionState } from 'react';
import type { AdminServiceDetail } from '@/lib/catalogue-admin';
import { Button } from '@/components/ui/Button';
import {
  adminArchiveService,
  adminDeleteService,
  adminSetServiceStatus,
  type CatalogueActionState,
} from '@/modules/catalogue/actions';

/* ============================================================
 * P4.6 — Publication, dépublication et archivage d'une
 * prestation. La suppression est refusée si des réservations
 * historiques existent (contrôle aussi côté serveur).
 * ============================================================ */

export function ServiceHeaderActions({
  service,
  canDelete,
}: {
  service: AdminServiceDetail;
  canDelete: boolean;
}) {
  const [publishState, publishAction, publishPending] = useActionState<
    CatalogueActionState,
    FormData
  >(adminSetServiceStatus, {});
  const [archiveState, archiveAction, archivePending] = useActionState<
    CatalogueActionState,
    FormData
  >(adminArchiveService, {});
  const [deleteState, deleteAction, deletePending] = useActionState<CatalogueActionState, FormData>(
    adminDeleteService,
    {},
  );

  const isPublished = service.status === 'PUBLISHED';
  const isArchived = service.status === 'ARCHIVED';
  const error = publishState.error ?? archiveState.error ?? deleteState.error;

  return (
    <div className="flex flex-col items-stretch gap-2 lg:items-end">
      <div className="flex flex-wrap gap-2">
        <form action={publishAction}>
          <input type="hidden" name="id" value={service.id} />
          <input
            type="hidden"

            name="status"
            value={isPublished ? 'DRAFT' : 'PUBLISHED'}
          />
          <Button
            type="submit"
            variant={isPublished ? 'secondary' : 'primary'}
            size="sm"
            loading={publishPending}
          >
            {isPublished ? 'Dépublier' : 'Publier'}
          </Button>
        </form>

        {!isArchived ? (
          <form
            action={archiveAction}
            onSubmit={(event) => {
              if (
                !window.confirm(
                  "Archiver cette prestation ? Elle disparaîtra du site public et restera dans l'historique.",
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

        {canDelete ? (
          <form
            action={deleteAction}
            onSubmit={(event) => {
              if (
                !window.confirm(
                  `Supprimer définitivement « ${service.name} » ? Cette action est irréversible.`,
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={service.id} />
            <Button type="submit" variant="danger" size="sm" loading={deletePending}>
              Supprimer
            </Button>
          </form>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="max-w-72 text-sm font-medium text-alert">
          {error}
        </p>
      ) : null}
      {publishState.success || archiveState.success ? (
        <p role="status" className="max-w-72 text-sm font-medium text-success">
          {publishState.success ?? archiveState.success}
        </p>
      ) : null}
    </div>
  );
}
