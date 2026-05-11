import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.username) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }
  const { inviteCode } = await req.json();
  if (!inviteCode) {
    return NextResponse.json({ error: 'inviteCode required' }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { inviteCode: inviteCode.trim().toUpperCase() } });
  if (!team) {
    return NextResponse.json({ error: 'invalid invite code' }, { status: 404 });
  }

  await prisma.teamMembership.upsert({
    where: { teamId_username: { teamId: team.id, username: session.username } },
    update: {},
    create: { teamId: team.id, username: session.username, role: 'member' },
  });

  return NextResponse.json({ team });
}
