import Link from 'next/link';

/* P2.5 : pied de page coordonnees, reseaux, liens legaux. Distinct du dashboard. */
export function Footer() {
  return (
    <footer className="mt-16 bg-cacao-deep text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-heading text-lg font-bold">Hairstyle by Patricia</p>
          <p className="mt-2 text-sm opacity-80">
            Tresses, vanilles, locs et coiffures protectrices. Reservation en ligne.
          </p>
        </div>
        <nav aria-label="Liens pratiques">
          <p className="font-semibold">Pratique</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>
              <Link href="/coiffures" className="opacity-80 hover:opacity-100 hover:underline">
                Catalogue
              </Link>
            </li>
            <li>
              <Link href="/salon" className="opacity-80 hover:opacity-100 hover:underline">
                Le salon
              </Link>
            </li>
            <li>
              <Link href="/faq" className="opacity-80 hover:opacity-100 hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/infos-pratiques"
                className="opacity-80 hover:opacity-100 hover:underline"
              >
                Infos pratiques
              </Link>
            </li>
            <li>
              <Link href="/contact" className="opacity-80 hover:opacity-100 hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/mentions-legales"
                className="opacity-80 hover:opacity-100 hover:underline"
              >
                Mentions legales
              </Link>
            </li>
            <li>
              <Link
                href="/confidentialite"
                className="opacity-80 hover:opacity-100 hover:underline"
              >
                Confidentialite
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="font-semibold">Nous suivre</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="opacity-80 hover:opacity-100 hover:underline"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="opacity-80 hover:opacity-100 hover:underline"
              >
                TikTok
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-cream/20 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Hairstyle by Patricia. Tous droits reserves.
      </p>
    </footer>
  );
}
