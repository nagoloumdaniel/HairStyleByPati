'use client';

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/* Rangée de cartes défilante (scroll-snap) avec flèches en verre.
   Les flèches n'apparaissent que si le défilement est possible dans ce sens. */
export function CardCarousel({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const items = Children.toArray(children);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update, items.length]);

  function scrollByPage(direction: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
  }

  const arrow =
    'glass-strong absolute top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full text-fg transition active:opacity-80';

  return (
    <div className="relative">
      <ul
        ref={ref}
        onScroll={update}
        aria-label={label}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-6 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <li
            key={i}
            className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-2.5rem)/3)]"
          >
            {item}
          </li>
        ))}
      </ul>
      {canPrev ? (
        <button
          type="button"
          aria-label="Voir les cartes précédentes"
          onClick={() => scrollByPage(-1)}
          className={`${arrow} -left-2 md:-left-5`}
        >
          <Chevron direction="left" />
        </button>
      ) : null}
      {canNext ? (
        <button
          type="button"
          aria-label="Voir les cartes suivantes"
          onClick={() => scrollByPage(1)}
          className={`${arrow} -right-2 md:-right-5`}
        >
          <Chevron direction="right" />
        </button>
      ) : null}
    </div>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`size-5 ${direction === 'left' ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
