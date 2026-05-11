import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { MarketDetail } from './MarketDetail';

export const dynamic = 'force-dynamic';

export default async function MarketPage({ params }: { params: { marketId: string } }) {
  const marketId = Number(params.marketId);
  const session = await getSession();
  const myTeams = session.username
    ? await prisma.team.findMany({
        where: { members: { some: { username: session.username } } },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      })
    : [];

  return (
    <MarketDetail
      marketId={marketId}
      username={session.username ?? null}
      myTeams={myTeams}
    />
  );
}
