import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.username) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }
  const { positionId, teamId, marketId, collateral, rationale } = await req.json();
  if (!positionId || !teamId || marketId === undefined || collateral === undefined) {
    return NextResponse.json(
      { error: 'positionId, teamId, marketId, collateral required' },
      { status: 400 },
    );
  }

  const cleanRationale =
    typeof rationale === 'string' && rationale.trim()
      ? rationale.trim().slice(0, 240)
      : null;

  const membership = await prisma.teamMembership.findUnique({
    where: { teamId_username: { teamId, username: session.username } },
  });
  if (!membership) {
    return NextResponse.json({ error: 'not a member of that team' }, { status: 403 });
  }

  const tag = await prisma.tradeTag.upsert({
    where: { positionId: String(positionId) },
    update: {
      teamId,
      marketId: Number(marketId),
      collateral: Number(collateral),
      username: session.username,
      rationale: cleanRationale,
    },
    create: {
      positionId: String(positionId),
      teamId,
      marketId: Number(marketId),
      collateral: Number(collateral),
      username: session.username,
      rationale: cleanRationale,
    },
  });
  return NextResponse.json({ tag });
}
