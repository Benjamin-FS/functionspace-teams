import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { generateInviteCode } from '@/lib/invite';
import { SIGILS, DEFAULT_SIGIL_ID } from '@/lib/sigils';

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { members: true, tradeTags: true } } },
  });
  return NextResponse.json({ teams });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.username) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }
  const { name, blurb, sigilId, tag } = await req.json();
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'name required (2+ chars)' }, { status: 400 });
  }

  const validSigil = SIGILS.find((s) => s.id === sigilId) ? sigilId : DEFAULT_SIGIL_ID;

  let cleanTag: string | null = null;
  if (typeof tag === 'string' && tag.trim()) {
    const t = tag.trim().toUpperCase();
    if (!/^[A-Z0-9]{2,4}$/.test(t)) {
      return NextResponse.json(
        { error: 'tag must be 2–4 letters or digits' },
        { status: 400 },
      );
    }
    cleanTag = t;
  }

  try {
    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        blurb: blurb?.trim() || null,
        inviteCode: generateInviteCode(),
        sigilId: validSigil,
        tag: cleanTag,
        members: {
          create: { username: session.username, role: 'captain' },
        },
      },
    });
    return NextResponse.json({ team });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'team name already taken' }, { status: 409 });
    }
    throw err;
  }
}
