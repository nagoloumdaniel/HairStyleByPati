import Link from 'next/link';
import { CardImages } from './CardImages';

export type PrestationCardProps = {
  href: string;
  bookHref: string;
  images: { src: string; alt: string }[];
  badge: string;
  title: string;
  subtitle?: string;
  price: string;
  duration: string;
  optionsLabel: string;
  priority?: boolean;
};

/* Carte prestation immersive (DESIGN-RULES.md) : photo plein cadre, voile et flou
   adaptés au thème, carte entièrement cliquable vers la fiche (lien étiré sur le titre). */
export function PrestationCard({
  href,
  bookHref,
  images,
  badge,
  title,
  subtitle,
  price,
  duration,
  optionsLabel,
  priority = false,
}: PrestationCardProps) {
  return (
    <article className="prestation-card group relative isolate aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] bg-line text-[#fff8d8] transition duration-300 focus-within:ring-4 focus-within:ring-accent hover:-translate-y-1">
      <CardImages images={images} priority={priority} />
      <div aria-hidden="true" className="card-blur pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="card-scrim pointer-events-none absolute inset-0" />

      <span className="absolute left-4 top-4 z-[2] rounded-full bg-black/35 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
        {badge}
      </span>

      <div className="absolute inset-x-0 bottom-0 z-[2] p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 font-heading text-xl font-bold leading-tight">
            <Link href={href} className="stretched-link rounded-sm outline-none">
              {title}
            </Link>
          </h3>
          <p className="shrink-0 text-right text-sm font-black text-[#ffd84d]">{price}</p>
        </div>
        {subtitle ? (
          <p className="mt-1 line-clamp-1 text-sm font-light text-[#fff8d8]/75">{subtitle}</p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/20 pt-3 text-sm">
          <p>
            <span className="font-light text-[#fff8d8]/70">Durée : </span>
            <span className="font-bold">{duration}</span>
          </p>
          <p className="hidden font-light text-[#fff8d8]/70 min-[380px]:block">{optionsLabel}</p>
          <Link
            href={bookHref}
            className="relative z-[3] rounded-full bg-[#ffd84d] px-3.5 py-1.5 text-xs font-black text-[#17150b] transition hover:brightness-110 active:scale-95"
          >
            Réserver
          </Link>
        </div>
      </div>
    </article>
  );
}
