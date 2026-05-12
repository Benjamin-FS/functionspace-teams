import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Sigil } from '@/lib/sigils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();

  const myTeams = session.username
    ? await prisma.team.findMany({
        where: { members: { some: { username: session.username } } },
        include: { _count: { select: { members: true, tradeTags: true } } },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const leaderboardRaw = await prisma.tradeTag.groupBy({
    by: ['teamId'],
    _sum: { collateral: true },
    orderBy: { _sum: { collateral: 'desc' } },
    take: 10,
  });
  const teamMap = new Map(
    (await prisma.team.findMany({ where: { id: { in: leaderboardRaw.map((r) => r.teamId) } } })).map(
      (t) => [t.id, t],
    ),
  );
  const leaderboard = leaderboardRaw
    .map((r) => ({ team: teamMap.get(r.teamId)!, total: r._sum.collateral ?? 0 }))
    .filter((r) => r.team);

  return (
    <>
      <section className="banner">
        <h1>Guilds</h1>
        <div className="tag">
          Band together. Bet on what's to come. Let the bold shape the market's
          view.
        </div>
      </section>

      {session.username ? (
        <section style={{ marginBottom: '2rem' }}>
          <div className="sigil">Your Guilds</div>
          {myTeams.length === 0 ? (
            <p className="muted">
              You haven't joined a guild yet.{' '}
              <Link href="/teams/new">Create one</Link> or{' '}
              <Link href="/teams">browse guilds</Link>.
            </p>
          ) : (
            <div className="cards">
              {myTeams.map((t) => (
                <Link key={t.id} href={`/teams/${t.id}`} className="card">
                  <div className="card-head">
                    <div className="sigil-badge"><Sigil id={t.sigilId} size={28} /></div>
                    <div className="card-head-text">
                      <h2 style={{ marginBottom: '0.1rem' }}>
                        {t.name}
                        {t.tag && <span className="guild-tag">{t.tag}</span>}
                      </h2>
                      <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                        {t._count.members} member{t._count.members === 1 ? '' : 's'} · {t._count.tradeTags} bet{t._count.tradeTags === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section style={{ marginBottom: '2rem' }} className="card">
          <p>
            <Link href="/login">Sign in</Link> with your functionSPACE username
            to start. New usernames are signed up automatically.
          </p>
        </section>
      )}

      <section>
        <div className="sigil">Leaderboard</div>
        {leaderboard.length === 0 ? (
          <p className="muted">No guild-tagged bets yet.</p>
        ) : (
          <table className="simple">
            <thead>
              <tr>
                <th>rank</th>
                <th>guild</th>
                <th>stake</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => (
                <tr key={row.team.id}>
                  <td>{i + 1}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', color: 'var(--gold)' }}>
                      <Sigil id={row.team.sigilId} size={20} />
                      <Link href={`/teams/${row.team.id}`}>{row.team.name}</Link>
                      {row.team.tag && <span className="guild-tag">{row.team.tag}</span>}
                    </span>
                  </td>
                  <td>
                    <span className="coin" aria-hidden /> {row.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Ranked by total stake across every guild-tagged bet. Once on-chain
          settlement arrives, this will switch to realised + unrealised P&amp;L.
        </p>
      </section>
    </>
  );
}
