'use client';

import Image from 'next/image';
import { IMAGE_BLUR_DATA_URL } from '@/lib/image-placeholder';
import { useState } from 'react';

type GalleryImage = { key: string; src: string; alt: string };

/**
 * Galerie de la fiche prestation (P3.3) : navigation sans quitter la page,
 * miniatures, boutons précédent/suivant et flèches clavier.
 * Le composant ne reçoit que des URLs résolues côté serveur.
 */
export function ServiceGallery({
  images,
  serviceName,
}: {
  images: GalleryImage[];
  serviceName: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const count = images.length;
  const active = images[index] ?? images[0]!;

  const goTo = (nextIndex: number) => setIndex((nextIndex + count) % count);

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-roledescription="carrousel"
        aria-label={`Galerie photos de ${serviceName}`}
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={(event) => {
          if (count < 2) return;
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goTo(index - 1);
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            goTo(index + 1);
          }
        }}
        className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-line shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:aspect-[4/5] lg:aspect-[4/5]"
      >
        <Image
          key={active.key}
          src={active.src}
          alt={active.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          quality={80}
          className="object-cover"
        />

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Photo précédente"
              className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-fg shadow-soft backdrop-blur transition hover:bg-card focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Photo suivante"
              className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-fg shadow-soft backdrop-blur transition hover:bg-card focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span aria-hidden="true">→</span>
            </button>
            <p
              aria-live="polite"
              className="absolute bottom-3 right-3 rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-panel-fg"
            >
              {index + 1} / {count}
            </p>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <ul aria-label="Miniatures de la galerie" className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, imageIndex) => {
            const activeThumb = imageIndex === index;
            return (
              <li key={image.key} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(imageIndex)}
                  aria-label={`Afficher la photo ${imageIndex + 1} sur ${count}`}
                  aria-current={activeThumb ? 'true' : undefined}
                  className={`relative block size-16 overflow-hidden rounded-[var(--radius-sm)] border-2 transition sm:size-20 ${
                    activeThumb
                      ? 'border-accent ring-2 ring-accent/40'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt=""
                    width={80}
                    height={80}
                    sizes="80px"
                    className="size-full object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
