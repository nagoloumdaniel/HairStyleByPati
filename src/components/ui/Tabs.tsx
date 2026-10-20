'use client';

import { useId, useState, type ReactNode } from 'react';

/* P2.3 + P2.9 : onglets clavier (role tablist, aria-selected). */
export function Tabs({
  tabs,
  defaultIndex = 0,
}: {
  tabs: ReadonlyArray<{ id: string; label: string; content: ReactNode }>;
  defaultIndex?: number;
}) {
  const [active, setActive] = useState(defaultIndex);
  const uid = useId();
  return (
    <div>
      <div role="tablist" aria-label="Onglets" className="flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={i === active}
            aria-controls={`${uid}-panel-${t.id}`}
            onClick={() => setActive(i)}
            className={`h-9 rounded-[var(--radius-md)] px-3.5 text-sm font-semibold transition ${
              i === active
                ? 'bg-accent text-accent-fg'
                : 'bg-card text-fg border border-line hover:border-cacao'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${uid}-panel-${tabs[active]?.id}`}
        aria-labelledby={`${uid}-tab-${tabs[active]?.id}`}
        className="mt-4"
      >
        {tabs[active]?.content}
      </div>
    </div>
  );
}
