import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getServerClient } from '@/lib/fs-client';
import { queryMarketState, queryMarketPositions } from '@functionspace/core';
import { aggregateMarketPositions, positionToContribution } from '@/lib/aggregate';
import { TeamMarketCard } from './TeamMarketCard';
import { InvitePill } from './InvitePill';
import { LeaveButton } from './LeaveButton';
import { ActivityFeed } from './ActivityFeed';
import { Sigil } from '@/lib/sigils';

export const dynamic = 'force-dynamic';

export default async function TeamPage({ params }: { params: { teamId: string } }) {
  const team = await prisma.team.findUnique({
    where: { id: params.teamId },
    include: {
      members: { orderBy: { joinedAt: 'asc' } },
      tradeTags: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!team) notFound();

  const session = await getSession();
  const isMember = !!team.members.find((m) => m.username === session.username);

  const marketIds = Array.from(new Set(team.tradeTags.map((t) => t.marketId)));
  const { client } = await getServerClient();

  const marketAggregates = await Promise.all(
    marketIds.map(async (marketId) => {
      try {
        const market = await queryMarketState(client, marketId);
        const tagsForMarket = team.tradeTags.filter((t) => t.marketId === marketId);
        const tagsByOwner = new Map<string, typeof tagsForMarket>();
        for (const t of tagsForMarket) {
          if (!tagsByOwner.has(t.username)) tagsByOwner.set(t.username, []);
          tagsByOwner.get(t.username)!.push(t);
        }

        const ownerPositions = await Promise.all(
          Array.from(tagsByOwner.keys()).map(async (username) => {
            const positions = await queryMarketPositions(client, marketId, username);
            const tagIds = new Set(tagsByOwner.get(username)!.map((t) => t.positionId));
            return positions.filter((p) => tagIds.has(String(p.positionId)));
          }),
        );

        const contributions = ownerPositions.flat().map(positionToContribution);
        const aggregate = aggregateMarketPositions(marketId, contributions);
        const rationales: Record<string, string> = {};
        for (const t of tagsForMarket) if (t.rationale) rationales[t.positionId] = t.rationale;
        return { marketId, market, aggregate, rationales, error: null as string | null };
      } catch (err) {
        return {
          marketId,
          market: null,
          aggregate: null,
          rationales: {},
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );

  const totalTeamCollateral = team.tradeTags.reduce((s, t) => s + t.collateral, 0);

  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="sigil-badge lg" style={{ color: 'var(--gold-bright)' }}>
            <Sigil id={team.sigilId} size={40} />
          </div>
          <div>
            <h1 style={{ marginBottom: 0 }}>
              {team.name}
              {team.tag && <span className="guild-tag" style={{ fontSize: '0.85rem' }}>{team.tag}</span>}
            </h1>
            {team.blurb && <p className="muted" style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>“{team.blurb}”</p>}
          </div>
        </div>
        <InvitePill code={team.inviteCode} />
      </header>

      <div className="row" style={{ marginTop: '1rem' }}>
        <div className="card" style={{ maxWidth: 320 }}>
          <h2>Members</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {team.members.map((m) => (
              <li key={m.username} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(201,161,61,0.08)' }}>
                <span>{m.username}</span>
                <span className="muted" style={{ fontSize: '0.78rem', fontFamily: 'var(--serif)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                  {m.role === 'captain' ? 'Captain' : 'Member'}
                </span>
              </li>
            ))}
          </ul>
          {isMember && session.username !== team.members[0]?.username && (
            <div style={{ marginTop: '0.75rem' }}>
              <LeaveButton teamId={team.id} />
            </div>
          )}
        </div>

        <div className="card">
          <h2>Guild Stake</h2>
          <p className="stat-big" style={{ margin: 0 }}>
            <span className="coin" aria-hidden /> {totalTeamCollateral.toFixed(2)}
          </p>
          <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Across {team.tradeTags.length} bet{team.tradeTags.length === 1 ? '' : 's'} on{' '}
            {marketIds.length} market{marketIds.length === 1 ? '' : 's'}.
          </p>
        </div>
      </div>

      <div className="sigil">Recent Activity</div>
      <ActivityFeed
        entries={team.tradeTags.slice(0, 25).map((t) => ({
          positionId: t.positionId,
          username: t.username,
          marketId: t.marketId,
          marketTitle:
            marketAggregates.find((m) => m.marketId === t.marketId)?.market?.title ?? null,
          collateral: t.collateral,
          rationale: t.rationale,
          createdAt: t.createdAt,
        }))}
      />

      <div className="sigil">Markets in Play</div>
      {marketIds.length === 0 ? (
        <p className="muted">
          No bets yet. <Link href="/markets">Browse markets</Link> and tag a bet
          to this guild.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {marketAggregates.map((entry) => {
            if (entry.error) {
              return (
                <div className="card" key={entry.marketId}>
                  <p className="error">
                    Could not load market {entry.marketId}: {entry.error}
                  </p>
                </div>
              );
            }
            if (!entry.market || !entry.aggregate) {
              // Market loaded but no live positions matched the guild's tagged
              // ids (e.g. the positions were sold, or the tag refers to a
              // position the SDK can't see). Surface it instead of pretending
              // it's an error.
              return (
                <div className="card" key={entry.marketId}>
                  <p className="muted">
                    Market {entry.marketId}
                    {entry.market?.title ? ` (${entry.market.title})` : ''}: the
                    guild's tagged bets are no longer active on this market.
                  </p>
                </div>
              );
            }
            return (
              <TeamMarketCard
                key={entry.market.marketId}
                market={entry.market}
                aggregate={entry.aggregate}
                rationales={entry.rationales}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
