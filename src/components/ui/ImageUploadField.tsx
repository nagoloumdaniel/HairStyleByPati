'use client';

import { ImageOff, ImagePlus, Star, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { Badge } from './Badge';
import { Button } from './Button';

/* ============================================================
 * Champ « photos » réutilisable pour un formulaire : jusqu'à `max` images,
 * miniatures, suppression, choix de la photo principale (la première).
 *
 * Il s'intègre à un <form> classique (FormData) via deux champs :
 * - `<name>`        : les NOUVEAUX fichiers (input file synchronisé) ;
 * - `<orderName>`   : JSON des jetons dans l'ordre final, « <id existant> » ou « new:<index> ».
 * La limite et la validation (type, taille, signature binaire) sont REVALIDÉES par le serveur ;
 * les contrôles d'ici ne servent qu'à guider l'utilisateur.
 * ============================================================ */

export interface ExistingImage {
  id: string;
  url: string | null;
  alt: string;
}

interface Item {
  token: string; // id existant, ou jeton local « tmp:<seq> » pour une nouvelle photo
  seq: number; // ordre de sélection (nouvelles photos)
  isNew: boolean;
  url: string | null;
  label: string;
  file?: File;
}

const DEFAULT_ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export function ImageUploadField({
  label = 'Photos',
  name = 'photos',
  orderName = 'photoOrder',
  initial = [],
  max = 3,
  maxBytes = DEFAULT_MAX_BYTES,
  accept = DEFAULT_ACCEPT,
  disabled = false,
  disabledReason,
  hint,
}: {
  label?: string;
  name?: string;
  orderName?: string;
  initial?: ExistingImage[];
  max?: number;
  maxBytes?: number;
  accept?: string[];
  disabled?: boolean;
  disabledReason?: string;
  hint?: string;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const seqRef = useRef(0);
  const [error, setError] = useState<string | undefined>();
  const [items, setItems] = useState<Item[]>(() =>
    initial.slice(0, max).map((image, index) => ({
      token: image.id,
      seq: -1,
      isNew: false,
      url: image.url,
      label: image.alt || `Photo ${index + 1}`,
    })),
  );

  // Nouvelles photos dans l'ordre de sélection : leur position = index dans le champ fichier.
  const newItems = items.filter((item) => item.isNew).sort((a, b) => a.seq - b.seq);
  const tokens = items.map((item) =>
    item.isNew ? `new:${newItems.findIndex((n) => n.token === item.token)}` : item.token,
  );

  // Synchronise l'input file caché (envoyé avec le formulaire) avec les nouvelles photos.
  useEffect(() => {
    const input = fileRef.current;
    if (!input) return;
    const transfer = new DataTransfer();
    for (const item of items.filter((i) => i.isNew).sort((a, b) => a.seq - b.seq)) {
      if (item.file) transfer.items.add(item.file);
    }
    input.files = transfer.files;
  }, [items]);

  // Libère les aperçus (blob:) au démontage.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  });
  useEffect(
    () => () => {
      for (const item of itemsRef.current) {
        if (item.isNew && item.url) URL.revokeObjectURL(item.url);
      }
    },
    [],
  );

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (picked.length === 0) return;
    const room = max - items.length;
    const added: Item[] = [];
    let message: string | undefined;
    for (const file of picked) {
      if (added.length >= room) {
        message = `${max} photos maximum par prestation.`;
        break;
      }
      if (!accept.includes(file.type)) {
        message = 'Format non accepté : utilisez une photo JPEG, PNG ou WebP.';
        continue;
      }
      if (file.size > maxBytes) {
        message = `La photo dépasse ${Math.round(maxBytes / (1024 * 1024))} Mo. Choisissez une image plus légère.`;
        continue;
      }
      seqRef.current += 1;
      added.push({
        token: `tmp:${seqRef.current}`,
        seq: seqRef.current,
        isNew: true,
        url: URL.createObjectURL(file),
        label: file.name,
        file,
      });
    }
    setError(message);
    if (added.length > 0) setItems((current) => [...current, ...added]);
  }

  function remove(token: string) {
    setError(undefined);
    setItems((current) => {
      const target = current.find((i) => i.token === token);
      if (target?.isNew && target.url) URL.revokeObjectURL(target.url);
      return current.filter((i) => i.token !== token);
    });
  }

  function makePrimary(token: string) {
    setItems((current) => {
      const target = current.find((i) => i.token === token);
      return target ? [target, ...current.filter((i) => i.token !== token)] : current;
    });
  }

  const full = items.length >= max;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span id={`${inputId}-label`} className="text-sm font-semibold text-fg">
          {label}
        </span>
        <span className="text-sm text-muted" aria-live="polite">
          {items.length}/{max}
        </span>
      </div>

      {/* Champs envoyés avec le formulaire. */}
      <input ref={fileRef} type="file" name={name} multiple hidden tabIndex={-1} aria-hidden />
      <input type="hidden" name={orderName} value={JSON.stringify(tokens)} />

      {items.length > 0 ? (
        <ul aria-labelledby={`${inputId}-label`} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((item, index) => (
            <li
              key={item.token}
              className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-line bg-card p-2"
            >
              <span className="relative block aspect-square overflow-hidden rounded-[var(--radius-sm)] bg-line">
                {item.url ? (
                  // Aperçu local (blob:) ou URL signée à durée limitée : pas d'optimisation next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.label}
                    decoding="async"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted">
                    <ImageOff aria-hidden="true" className="size-6" />
                    <span className="sr-only">Image indisponible</span>
                  </span>
                )}
                {index === 0 ? (
                  <Badge tone="accent" className="absolute left-1.5 top-1.5">
                    Principale
                  </Badge>
                ) : null}
              </span>
              <div className="flex items-center justify-between gap-2">
                {index === 0 ? (
                  <span className="text-xs text-muted">
                    {item.isNew ? 'Nouvelle' : 'Enregistrée'}
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={Star}
                    iconOnly
                    disabled={disabled}
                    onClick={() => makePrimary(item.token)}
                    aria-label={`Définir ${item.label} comme photo principale`}
                    title="Définir comme principale"
                  >
                    Définir comme principale
                  </Button>
                )}
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  iconOnly
                  disabled={disabled}
                  onClick={() => remove(item.token)}
                  aria-label={`Retirer ${item.label}`}
                  title="Retirer"
                >
                  Retirer
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={pickerRef}
        id={inputId}
        type="file"
        multiple
        accept={accept.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onPick}
      />
      <div>
        <Button
          type="button"
          variant="secondary"
          icon={ImagePlus}
          disabled={disabled || full}
          onClick={() => pickerRef.current?.click()}
        >
          {full ? `${max} photos maximum atteintes` : 'Ajouter des photos'}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-alert">
          {error}
        </p>
      ) : disabled && disabledReason ? (
        <p className="text-sm text-alert">{disabledReason}</p>
      ) : (
        <p className="text-sm text-muted">
          {hint ??
            `JPEG, PNG ou WebP, 5 Mo maximum, ${max} photos au plus. La première est la photo principale.`}
        </p>
      )}
    </div>
  );
}
