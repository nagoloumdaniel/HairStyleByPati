import { headers } from 'next/headers';
import { Sidebar } from '@/components/layout/Sidebar';

/* P2.6 : coquille dashboard, sidebar sombre distincte du public.
   Sur mobile, la navigation devient une barre horizontale compacte. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? undefined;
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:gap-6 lg:py-8">
      <aside className="min-w-0 rounded-[var(--radius-lg)] bg-ink p-2 text-panel-fg shadow-lift lg:sticky lg:top-20 lg:self-start lg:p-4">
        <p className="hidden px-4 pb-3 font-heading text-sm font-bold uppercase tracking-wide text-accent lg:block">
          Administration
        </p>
        <Sidebar pathname={pathname} />
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
