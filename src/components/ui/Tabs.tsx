'use client';

import { useState, type ReactNode } from 'react';

/* P2.3 + P2.9 : onglets clavier (role tablist, aria-selected). */
export function Tabs({
  tabs,
  defaultIndex = 0,
}: {
  tabs: ReadonlyArray<{ id: string; label: string; content: ReactNode }>;
  defaultIndex?: number;
}) {
  const [active, setActive] = useState(defaultIndex);
  return (
    <div>
      <div role="tablist" aria-label="Onglets" className="flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={i === active}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              i === active ? 'bg-ink text-cream' : 'bg-cream-dark text-ink hover:bg-accent-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${tabs[active]?.id}`}
        aria-labelledby={`tab-${tabs[active]?.id}`}
        className="mt-4"
      >
        {tabs[active]?.content}
      </div>
    </div>
  );
}
