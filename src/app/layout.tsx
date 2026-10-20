import { ToastProvider } from '@/components/ui/Toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HideOnAuth } from '@/components/layout/HideOnAuth';
import LocalBusiness from '@/components/seo/LocalBusiness';
import { LOCAL_BUSINESS } from '@/components/seo/LocalBusiness';
import type { Metadata } from 'next';
import { Lato, Playfair_Display } from 'next/font/google';
import './globals.css';

/* P1.3 — polices optimisées via next/font : préchargement, swap,
   zéro requête externe, poids limités au strict nécessaire. */
const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['100', '300', '400', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');
const SITE_DESCRIPTION =
  'Départ et retwist de locs, nattes collées, vanilles. Coiffure à domicile à Dakar pour hommes et femmes : catalogue, diagnostic capillaire et réservation en ligne.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Hairstyle by Patricia — Locs, nattes collées et vanilles à Dakar',
    template: '%s | Hairstyle by Patricia',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Hairstyle by Patricia',
  authors: [{ name: 'Hairstyle by Patricia' }],
  keywords: [
    'coiffure Dakar',
    'retwist locs',
    'départ de locs',
    'nattes collées',
    'vanilles',
    'coiffure à domicile',
    'cheveux naturels',
    'Hairstyle by Patricia',
  ],
  category: 'beauty',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: '/',
    siteName: 'Hairstyle by Patricia',
    title: 'Hairstyle by Patricia — Locs, nattes collées et vanilles à Dakar',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hairstyle by Patricia — Locs, nattes collées et vanilles à Dakar',
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

/* Applique le thème avant le premier rendu pour éviter tout flash clair.
   Priorité : choix enregistré, sinon préférence système. */
const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=(s==='dark'||s==='light')?s:(d?'dark':'light');var r=document.documentElement;r.setAttribute('data-theme',t);r.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'#17150B':'#FFFCF0');}catch(e){}})();
/* Extensions antivirus (Bitdefender) ajoutent bis_skin_checked sur les div avant l'hydratation : on les retire pour éviter un faux mismatch. */
(function(){try{var a='bis_skin_checked';var c=function(){document.querySelectorAll('['+a+']').forEach(function(n){n.removeAttribute(a)})};c();var o=new MutationObserver(function(ms){ms.forEach(function(m){if(m.target&&m.target.removeAttribute)m.target.removeAttribute(a)})});o.observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:[a]});setTimeout(function(){o.disconnect()},10000);}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${lato.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FFFCF0" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        {/* P2.9 : lien d'evitement clavier */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-accent-fg"
        >
          Aller au contenu
        </a>
        {/* P3.8 : donnees structurees LocalBusiness (JSON-LD) */}
        <LocalBusiness data={LOCAL_BUSINESS} />
        <ToastProvider>
          <Header />
          <div id="contenu">{children}</div>
          <HideOnAuth>
            <Footer />
          </HideOnAuth>
        </ToastProvider>
      </body>
    </html>
  );
}
