import { ToastProvider } from '@/components/ui/Toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Metadata } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
import './globals.css';

/* P1.3 — polices optimisées via next/font : préchargement, swap,
   zéro requête externe, poids limités au strict nécessaire. */
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hairstyle by Patricia',
  description: 'Salon de coiffure spécialisé tresses, vanilles et locs — réservation en ligne.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${manrope.variable} ${playfair.variable}`}>
      <body>
        {/* P2.9 : lien d'evitement clavier */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
        >
          Aller au contenu
        </a>
        <ToastProvider>
          <Header />
          <div id="contenu">{children}</div>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
