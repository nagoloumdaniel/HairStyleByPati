'use client';

import Link from 'next/link';
import { useState } from 'react';

/* P2.5 : header public mobile-first, navigation clavier, menu hamburger accessible. */
const LINKS = [
  { href: '/coiffures', label: 'Coiffures' },
  { href: '/#prestations', label: 'Prestations' },
  { href: '/#salon', label: 'Le salon' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-cream-dark bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-heading text-xl font-bold text-ink">
          Hairstyle <span className="text-cacao">by Patricia</span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="font-medium text-ink hover:text-cacao">
              {l.label}
            </Link>
          ))}
          <Link
            href="/reserver"
            className="rounded-[var(--radius-md)] bg-accent px-5 py-2.5 font-semibold text-ink shadow-soft transition hover:bg-accent-hover"
          >
            Reserver
          </Link>
        </nav>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((v) => !v)}
          className="rounded-[var(--radius-sm)] p-2 text-ink md:hidden"
        >
          <span aria-hidden="true" className="text-2xl">
            {open ? '✕' : '☰'}
          </span>
        </button>
      </div>
      {open ? (
        <nav
          id="menu-mobile"
          aria-label="Navigation mobile"
          className="border-t border-cream-dark bg-cream px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-[var(--radius-sm)] px-3 py-2.5 font-medium hover:bg-accent-soft"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/reserver"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-[var(--radius-md)] bg-accent px-3 py-2.5 text-center font-semibold text-ink"
              >
                Reserver
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
