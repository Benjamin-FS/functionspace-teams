import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { JoinByCode } from './JoinByCode';
import { Sigil } from '@/lib/sigils';

export default async function TeamsPage() {
  const session = await getSession();
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { members: true, tradeTags: true } } },
  });
  const myMemberships = session.username
    ? new Set(
        (
          await prisma.teamMembership.findMany({
            where: { username: session.username },
            select: { teamId: true },
          })
        ).map((m) => m.teamId),
      )
    : new Set<string>();

  return (
    <>
      <section className="banner">
        <h1>The Guildhall</h1>
        <div className="tag">
          Every guild tracks its members, its stake, and the markets it bets on.
          Start your own, or join one with an invite code.
        </div>
      </section>

      <div className="row" style={{ marginBottom: '1.5rem' }}>
        {session.username ? (
          <>
            <div className="card">
              <h2>Start a Guild</h2>
              <p className="muted">
                Create a new guild, get an invite code, and share it with your
                friends.
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                <Link href="/teams/new">→ Create a guild</Link>
              </p>
            </div>
            <div className="card">
              <h2>Join with an Invite Code</h2>
              <p className="muted">
                Got a code from a guild captain? Enter it here.
              </p>
              <JoinByCode />
            </div>
          </>
        ) : (
          <div className="card">
            <p className="muted">
              <Link href="/login">Sign in</Link> to start or join a guild.
            </p>
          </div>
        )}
      </div>

      <div className="sigil">All Guilds</div>
      {teams.length === 0 ? (
        <p className="muted">No guilds yet.</p>
      ) : (
        <div className="cards">
          {teams.map((t) => (
            <Link key={t.id} href={`/teams/${t.id}`} className="card">
              <div className="card-head">
                <div className="sigil-badge"><Sigil id={t.sigilId} size={28} /></div>
                <div className="card-head-text" style={{ minWidth: 0 }}>
                  <h2 style={{ marginBottom: '0.1rem' }}>
                    {t.name}
                    {t.tag && <span className="guild-tag">{t.tag}</span>}
                  </h2>
                  {t.blurb && (
                    <p className="muted" style={{ marginTop: 0, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      “{t.blurb}”
                    </p>
                  )}
                </div>
              </div>
              <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.6rem' }}>
                {t._count.members} member{t._count.members === 1 ? '' : 's'} ·{' '}
                {t._count.tradeTags} bet{t._count.tradeTags === 1 ? '' : 's'}
                {myMemberships.has(t.id) && ' · joined'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
