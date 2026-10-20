'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

/* Retour à la page précédente ; `fallbackHref` si l'historique est vide (accès direct). */
export function BackButton({
  fallbackHref,
  label = 'Retour',
}: {
  fallbackHref: string;
  label?: string;
}) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallbackHref))}
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      {label}
    </Button>
  );
}
