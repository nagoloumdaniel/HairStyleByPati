'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { IMAGE_BLUR_DATA_URL } from '@/lib/image-placeholder';

type Img = { src: string; alt: string };

/* Photos de la carte : fondu entre images au survol/focus, points d'indication.
   Sans survol, la première photo reste affichée (pas de mouvement non sollicité). */
export function CardImages({ images, priority = false }: { images: Img[]; priority?: boolean }) {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);
  const count = images.length;

  useEffect(() => {
    if (!active || count < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 1800);
    return () => window.clearInterval(id);
  }, [active, count]);

  function stop() {
    setActive(false);
    setIndex(0);
  }

  return (
    <div
      className="absolute inset-0"
      onPointerEnter={() => setActive(true)}
      onPointerLeave={stop}
      onFocus={() => setActive(true)}
      onBlur={stop}
    >
      {images.map((image, i) => (
        <Image
          key={image.src}
          src={image.src}
          alt={i === index ? image.alt : ''}
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 46vw, 32vw"
          priority={priority && i === 0}
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          quality={80}
          className={`object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      {count > 1 ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[8.25rem] z-[1] flex justify-center gap-1.5"
        >
          {images.map((image, i) => (
            <span
              key={image.src}
              className={`h-1.5 rounded-full bg-white transition-all ${
                i === index ? 'w-4 opacity-100' : 'w-1.5 opacity-50'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
