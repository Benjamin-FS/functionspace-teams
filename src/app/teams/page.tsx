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
          Every banner records its members, its stake, and the prophecies it
          chases. Found one of thine own, or pledge thy name to another.
        </div>
      </section>

      <div className="row" style={{ marginBottom: '1.5rem' }}>
        {session.username ? (
          <>
            <div className="card">
              <h2>Raise a Banner</h2>
              <p className="muted">
                Found a new guild, claim a seal of summoning, and bid thy fellows
                join.
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                <Link href="/teams/new">→ Found a guild</Link>
              </p>
            </div>
            <div className="card">
              <h2>Answer a Summons</h2>
              <p className="muted">
                Hast thou a seal of summoning from a captain? Speak it here.
              </p>
              <JoinByCode />
            </div>
          </>
        ) : (
          <div className="card">
            <p className="muted">
              <Link href="/login">Enter the realm</Link> to raise a banner or
              answer a summons.
            </p>
          </div>
        )}
      </div>

      <div className="sigil">Banners of the Realm</div>
      {teams.length === 0 ? (
        <p className="muted">No guild yet flies a banner.</p>
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
                {t._count.tradeTags} wager{t._count.tradeTags === 1 ? '' : 's'}
                {myMemberships.has(t.id) && ' · sworn'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
