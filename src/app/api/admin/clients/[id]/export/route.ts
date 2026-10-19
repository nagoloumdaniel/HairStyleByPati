import { NextResponse } from 'next/server';
import { auth } from '@/modules/auth/auth';
import { collectCustomerData } from '@/modules/clients/rgpd';

/* P9.6 : export des données d'une cliente, réservé à l'administration. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  const { id } = await params;
  const data = await collectCustomerData(id);
  if (!data) {
    return NextResponse.json({ error: 'Fiche cliente introuvable.' }, { status: 404 });
  }
  const filename = `cliente-${id}-donnees-personnelles.json`;
  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
