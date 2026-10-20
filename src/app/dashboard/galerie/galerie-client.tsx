'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  adminDeleteGalleryPhoto,
  adminUpdateGalleryPhoto,
  adminUploadGalleryPhoto,
  type GalleryActionState,
} from '@/modules/galerie/actions';

type GalleryRow = {
  id: string;
  key: string;
  alt: string;
  consentConfirmed: boolean;
  published: boolean;
  service: { id: string; name: string } | null;
};

function UploadForm({ services }: { services: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<GalleryActionState, FormData>(
    adminUploadGalleryPhoto,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-[var(--radius-md)] border border-line bg-card p-4"
    >
      <h2 className="font-semibold text-fg">Ajouter une photo</h2>
      <label className="text-sm font-semibold text-fg" htmlFor="gallery-file">
        Photo
      </label>
      <input id="gallery-file" type="file" name="file" accept="image/*" required />
      <div>
        <label className="text-sm font-semibold text-fg" htmlFor="gallery-service">
          Prestation associée (facultatif)
        </label>
        <select
          id="gallery-service"
          name="serviceId"
          className="mt-1 w-full max-w-sm rounded-[var(--radius-md)] border border-line bg-card px-4 py-2.5 text-fg"
        >
          <option value="">Aucune</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>
      <Input label="Texte alternatif" name="alt" maxLength={200} />
      <label className="flex items-center gap-2 text-sm font-semibold text-fg">
        <input type="checkbox" name="consentConfirmed" className="size-4" required />
        La cliente a explicitement autorisé l’usage public de cette photo.
      </label>
      {state.error ? (
        <p role="alert" className="text-sm font-medium text-alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm font-medium text-success">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" loading={pending}>
        Ajouter
      </Button>
    </form>
  );
}

function PhotoActions({ photo }: { photo: GalleryRow }) {
  const [publishState, publishAction, publishPending] = useActionState<
    GalleryActionState,
    FormData
  >(adminUpdateGalleryPhoto, {});
  const [deleteState, deleteAction, deletePending] = useActionState<GalleryActionState, FormData>(
    adminDeleteGalleryPhoto,
    {},
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={publishAction}>
        <input type="hidden" name="id" value={photo.id} />
        <input type="hidden" name="serviceId" value={photo.service?.id ?? ''} />
        <input type="hidden" name="alt" value={photo.alt} />
        <input type="hidden" name="consentConfirmed" value="true" />
        <input type="hidden" name="published" value={String(!photo.published)} />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          loading={publishPending}
          disabled={!photo.consentConfirmed}
        >
          {photo.published ? 'Dépublier' : 'Publier'}
        </Button>
      </form>
      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm('Supprimer définitivement cette photo ?')) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={photo.id} />
        <Button type="submit" variant="danger" size="sm" loading={deletePending}>
          Supprimer
        </Button>
      </form>
      {publishState.error || deleteState.error ? (
        <span role="alert" className="text-xs text-alert">
          {publishState.error ?? deleteState.error}
        </span>
      ) : null}
    </div>
  );
}

export function GalerieClient({
  photos,
  services,
}: {
  photos: GalleryRow[];
  services: { id: string; name: string }[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <UploadForm services={services} />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {photos.length === 0 ? (
          <p className="col-span-full rounded-[var(--radius-md)] border border-dashed border-line p-8 text-center text-muted">
            Aucune photo. Ajoutez-en une ci-dessus.
          </p>
        ) : (
          photos.map((photo) => (
            <li
              key={photo.id}
              className="rounded-[var(--radius-md)] border border-line bg-card p-4"
            >
              <p className="flex items-center gap-2 font-semibold text-fg">
                {photo.service?.name ?? 'Sans prestation'}
                <Badge tone={photo.published ? 'success' : 'neutral'}>
                  {photo.published ? 'Publiée' : 'Non publiée'}
                </Badge>
              </p>
              <p className="mt-1 text-sm text-muted">
                {photo.consentConfirmed ? 'Autorisation confirmée' : 'Autorisation manquante'}
              </p>
              <div className="mt-3">
                <PhotoActions photo={photo} />
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
