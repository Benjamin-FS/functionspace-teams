import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(_req: NextRequest, { params }: { params: { teamId: string } }) {
  const session = await getSession();
  if (!session.username) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }
  await prisma.teamMembership.delete({
    where: { teamId_username: { teamId: params.teamId, username: session.username } },
  }).catch(() => {});
  return NextResponse.json({ ok: true });
}
