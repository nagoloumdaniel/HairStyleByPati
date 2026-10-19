'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import type { AdminServiceImage } from '@/lib/catalogue-admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  adminDeleteImage,
  adminReorderImages,
  adminSetPrimaryImage,
  adminUpdateImageAlt,
  adminUploadServiceImage,
  type CatalogueActionState,
} from '@/modules/catalogue/actions';

/* ============================================================
 * P4.4 / P4.5 — Photos d'une prestation : upload contrôlé,
 * image principale, texte alternatif, ordre et suppression.
 * Les images sont servies par URL signée, jamais publiques.
 * ============================================================ */

type ImageWithUrl = AdminServiceImage & { url: string | null };

function UploadForm({ serviceId, storageReady }: { serviceId: string; storageReady: boolean }) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminUploadServiceImage,
    {},
  );
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.success && fileRef.current) fileRef.current.value = '';
  }, [state.success]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-line p-4"
    >
      <input type="hidden" name="serviceId" value={serviceId} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="service-image-file" className="text-sm font-semibold">
          Photo (JPEG, PNG ou WebP, 5 Mo maximum)
        </label>
        <input
          ref={fileRef}
          id="service-image-file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          disabled={!storageReady}
          className="w-full rounded-[var(--radius-md)] border border-line bg-card px-4 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-fg"
        />
      </div>
      <Input
        label="Texte alternatif (description pour l'accessibilité)"
        name="alt"
        maxLength={160}
        hint="Décrivez la coiffure visible sur la photo, sans mention inutile."
        disabled={!storageReady}
      />
      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] bg-alert-soft px-3 py-2 text-sm font-medium text-alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          role="status"
          className="rounded-[var(--radius-md)] bg-success-soft px-3 py-2 text-sm font-medium text-success"
        >
          {state.success}
        </p>
      ) : null}
      <Button type="submit" loading={pending} disabled={!storageReady} className="self-start">
        Envoyer la photo
      </Button>
    </form>
  );
}

function AltForm({ image, onDone }: { image: ImageWithUrl; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminUpdateImageAlt,
    {},
  );
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (state.success) doneRef.current();
  }, [state.success]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={image.id} />
      <Input
        label="Texte alternatif"
        name="alt"
        maxLength={160}
        defaultValue={image.alt}
        hint="160 caractères maximum."
      />
      {state.error ? (
        <p role="alert" className="text-sm font-medium text-alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" loading={pending}>
        Enregistrer
      </Button>
    </form>
  );
}

function ReorderImageForm({
  serviceId,
  images,
  index,
  direction,
}: {
  serviceId: string;
  images: ImageWithUrl[];
  index: number;
  direction: -1 | 1;
}) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminReorderImages,
    {},
  );
  const target = index + direction;
  const current = images[index];
  const swap = images[target];
  if (!current || !swap) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] border border-line text-muted/40"
      >
        {direction === -1 ? '↑' : '↓'}
      </span>
    );
  }
  const reordered = [...images];
  reordered[index] = swap;
  reordered[target] = current;

  return (
    <form action={formAction}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input
        type="hidden"
        name="orderedIds"
        value={JSON.stringify(reordered.map((image) => image.id))}
      />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        loading={pending}
        aria-label={`${direction === -1 ? 'Monter' : 'Descendre'} la photo`}
        title={direction === -1 ? 'Monter' : 'Descendre'}
      >
        {direction === -1 ? '↑' : '↓'}
      </Button>
      {state.error ? (
        <span role="alert" className="text-xs text-alert">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

function PrimaryImageForm({ serviceId, image }: { serviceId: string; image: ImageWithUrl }) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminSetPrimaryImage,
    {},
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="id" value={image.id} />
      <Button type="submit" variant="secondary" size="sm" loading={pending}>
        Définir comme principale
      </Button>
      {state.error ? (
        <p role="alert" className="text-xs text-alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function DeleteImageForm({ image }: { image: ImageWithUrl }) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminDeleteImage,
    {},
  );
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm('Supprimer cette photo ? Le fichier sera aussi supprimé du stockage.')
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={image.id} />
      <Button type="submit" variant="danger" size="sm" loading={pending}>
        Supprimer
      </Button>
      {state.error ? (
        <p role="alert" className="text-xs text-alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function ImageCard({
  serviceId,
  image,
  index,
  images,
}: {
  serviceId: string;
  image: ImageWithUrl;
  index: number;
  images: ImageWithUrl[];
}) {
  const [altOpen, setAltOpen] = useState(false);

  return (
    <li className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-line bg-card p-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)] bg-line">
        {image.url ? (
          // URL signée à durée limitée, impossible à déclarer dans next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={image.alt || 'Photo de la prestation'}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 p-3 text-center text-xs text-muted">
            <span aria-hidden="true" className="text-2xl">
              🖼
            </span>
            Aperçu indisponible (stockage non configuré ou URL expirée).
          </div>
        )}
        {image.isPrimary ? (
          <span className="absolute left-2 top-2">
            <Badge tone="accent">Principale</Badge>
          </span>
        ) : null}
      </div>

      <p className="line-clamp-2 min-h-10 text-sm text-muted">
        {image.alt || "Aucun texte alternatif : ajoutez-en un pour l'accessibilité."}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <ReorderImageForm serviceId={serviceId} images={images} index={index} direction={-1} />
        <ReorderImageForm serviceId={serviceId} images={images} index={index} direction={1} />
        {!image.isPrimary ? <PrimaryImageForm serviceId={serviceId} image={image} /> : null}
        <Button type="button" variant="secondary" size="sm" onClick={() => setAltOpen(true)}>
          Texte alternatif
        </Button>
        <DeleteImageForm image={image} />
      </div>

      <Modal open={altOpen} onClose={() => setAltOpen(false)} title="Texte alternatif de la photo">
        <AltForm image={image} onDone={() => setAltOpen(false)} />
      </Modal>
    </li>
  );
}

export function ImagesPanel({
  serviceId,
  images,
  storageReady,
  storageHint,
}: {
  serviceId: string;
  images: ImageWithUrl[];
  storageReady: boolean;
  storageHint: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {!storageReady ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] border border-alert bg-alert-soft px-4 py-3 text-sm text-alert"
        >
          {storageHint}
        </p>
      ) : null}

      <UploadForm serviceId={serviceId} storageReady={storageReady} />

      {images.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-line p-8 text-center text-muted">
          Aucune photo. La première photo envoyée devient la photo principale.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <ImageCard
              key={image.id}
              serviceId={serviceId}
              image={image}
              index={index}
              images={images}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
