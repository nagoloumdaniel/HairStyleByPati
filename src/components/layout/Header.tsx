'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/shared/Logo';
import { SocialLinks } from './SocialLinks';
import { ThemeToggle } from './ThemeToggle';

/* Navbar flottante en verre (web + mobile) : pilule détachée du bord, flou,
   menu mobile déployé dans la même capsule. Règles : DESIGN-RULES.md. */
const LINKS = [
  { href: '/coiffures', label: 'Catalogue' },
  { href: '/faq', label: 'FAQ' },
  { href: '/demandes-personnalisees', label: 'Sur mesure' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Réserve la hauteur de la navbar fixe pour ne pas masquer le contenu. */}
      <div aria-hidden="true" className="h-[4.75rem] md:h-24" />
      <header className="nav-floating glass-strong" data-open={open}>
        <div className="flex items-center justify-between gap-3 py-2 pl-5 pr-2.5 md:pr-3">
          <Link href="/" className="shrink-0" aria-label="Hairstyle by Patricia, accueil">
            <Logo markClassName="h-8 w-auto text-fg" wordmarkClassName="hidden sm:inline" />
          </Link>
          <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    active ? 'bg-accent-soft text-fg' : 'text-fg hover:bg-accent-soft'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <SocialLinks className="hidden lg:flex" />
            <ThemeToggle />
            <Link
              href="/coiffures"
              className="bg-gradient-primary rounded-full px-5 py-2.5 text-sm font-bold text-accent-fg shadow-soft transition hover:brightness-110 active:scale-[0.98]"
            >
              Réserver
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-fg hover:bg-accent-soft md:hidden"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                {open ? (
                  <X aria-hidden="true" className="size-5" />
                ) : (
                  <Menu aria-hidden="true" className="size-5" />
                )}
              </span>
            </button>
          </div>
        </div>
        {open ? (
          <nav
            id="menu-mobile"
            aria-label="Navigation mobile"
            className="border-t border-line px-3 pb-3 pt-2 md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={pathname === l.href ? 'page' : undefined}
                    className="block rounded-[var(--radius-md)] px-4 py-3 font-bold text-fg hover:bg-accent-soft aria-[current=page]:bg-accent-soft"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <SocialLinks className="mt-2 justify-center border-t border-line pt-2" />
          </nav>
        ) : null}
      </header>
    </>
  );
}
