import { headers } from 'next/headers';
import { Sidebar } from '@/components/layout/Sidebar';

/* P2.6 : coquille dashboard, sidebar sombre distincte du public. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? undefined;
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-[var(--radius-lg)] bg-ink p-4 text-cream shadow-lift lg:sticky lg:top-20 lg:self-start">
        <p className="px-4 pb-3 font-heading text-sm font-bold uppercase tracking-wide text-accent">
          Administration
        </p>
        <Sidebar pathname={pathname} />
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
