/**
 * P3.8 — Données structurées LocalBusiness (JSON-LD) pour Patricia.
 * Aide les moteurs de recherche à afficher les infos de l’activité (nom, adresse,
 * horaires, téléphone) dans les résultats enrichis.
 */

export interface LocalBusinessData {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  telephone: string;
  email: string;
  priceRange: string;
  servesCity: string;
  openingHours: Array<{ dayOfWeek: string; opens: string; closes: string }>;
}

export const LOCAL_BUSINESS: LocalBusinessData = {
  name: 'Hairstyle by Patricia',
  address: {
    streetAddress: 'Dakar',
    addressLocality: 'Dakar',
    addressRegion: 'Dakar',
    addressCountry: 'SN',
  },
  telephone: '+221770000000',
  email: 'contact@hairstylebypati.fr',
  priceRange: 'FCFA',
  servesCity: 'Dakar',
  openingHours: [
    { dayOfWeek: 'https://schema.org/Tuesday', opens: '10:00', closes: '19:00' },
    { dayOfWeek: 'https://schema.org/Wednesday', opens: '10:00', closes: '19:00' },
    { dayOfWeek: 'https://schema.org/Thursday', opens: '10:00', closes: '19:00' },
    { dayOfWeek: 'https://schema.org/Friday', opens: '10:00', closes: '19:00' },
    { dayOfWeek: 'https://schema.org/Saturday', opens: '10:00', closes: '19:00' },
  ],
};

/**
 * Génère le bloc JSON-LD LocalBusiness.
 * Le composant est un Server Component : le script est rendu statiquement dans le HTML.
 */
export default function LocalBusiness({ data }: { data: LocalBusinessData }) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: data.name,
    logo: `${appUrl}/brand/logo-mark-og.png`,
    image:
      'https://images.pexels.com/photos/10825829/pexels-photo-10825829.jpeg?auto=compress&cs=tinysrgb&w=400',
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion,
      addressCountry: data.address.addressCountry,
    },
    telephone: data.telephone,
    email: data.email,
    priceRange: data.priceRange,
    servesCity: data.servesCity,
    openingHoursSpecification: data.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
