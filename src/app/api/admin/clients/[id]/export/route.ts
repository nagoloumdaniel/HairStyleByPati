import { NextResponse } from 'next/server';
import { requireAdmin } from '@/modules/auth/guards';
import { logAudit } from '@/modules/stats/audit';
import { collectCustomerData } from '@/modules/clients/rgpd';

/* P9.6 : export des données d'une cliente, réservé à l'administration. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Rôle ADMIN exigé (une simple session ne suffit pas).
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(id)) {
    return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 });
  }
  const data = await collectCustomerData(id);
  if (!data) {
    return NextResponse.json({ error: 'Fiche cliente introuvable.' }, { status: 404 });
  }
  await logAudit({
    userId: user.id,
    action: 'customer.export',
    entityType: 'Customer',
    entityId: id,
  }).catch(() => undefined);
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
