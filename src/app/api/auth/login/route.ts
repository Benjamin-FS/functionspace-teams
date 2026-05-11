import { NextRequest, NextResponse } from 'next/server';
import { passwordlessLoginUser } from '@functionspace/core';
import { getGuestClient } from '@/lib/fs-client';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  if (!username || typeof username !== 'string') {
    return NextResponse.json({ error: 'username required' }, { status: 400 });
  }

  try {
    const client = getGuestClient();
    const result = await passwordlessLoginUser(client, username.trim());
    const session = await getSession();
    session.username = result.user.username;
    session.token = result.token;
    await session.save();
    return NextResponse.json({ user: result.user, action: result.action });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'login failed' },
      { status: 401 },
    );
  }
}
