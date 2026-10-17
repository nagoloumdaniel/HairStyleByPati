'use client';

import { useState } from 'react';

/* P2.3 + P2.9 : accordeon natif details/summary, clavier gratuit, sans JS superflu. */
export function Accordion({
  items,
}: {
  items: ReadonlyArray<{ id: string; title: string; content: string }>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-[var(--radius-md)] border border-cream-dark bg-surface shadow-soft"
          >
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`accordion-${item.id}`}
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
            >
              {item.title}
              <span aria-hidden="true" className="text-cacao">
                {open ? '−' : '+'}
              </span>
            </button>
            {open ? (
              <p id={`accordion-${item.id}`} className="px-5 pb-5 text-ink-soft">
                {item.content}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
