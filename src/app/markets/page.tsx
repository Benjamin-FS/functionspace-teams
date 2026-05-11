import { getServerClient } from '@/lib/fs-client';
import { discoverMarkets } from '@functionspace/core';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MarketsPage() {
  const { client } = await getServerClient();

  let markets: Awaited<ReturnType<typeof discoverMarkets>> = [];
  let error: string | null = null;
  try {
    markets = await discoverMarkets(client, { limit: 50 });
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <>
      <section className="banner">
        <h1>The Oracles</h1>
        <div className="tag">
          Every prophecy hath its pool. Place thy wager upon the shape of the
          future, and bind the deed to a banner.
        </div>
      </section>
      {error && (
        <div className="card">
          <p className="error">The oracles are silent: {error}</p>
        </div>
      )}
      {!error && markets.length === 0 && <p className="muted">No prophecy yet inscribed.</p>}
      <div className="cards" style={{ marginTop: '1rem' }}>
        {markets.map((m: any) => (
          <Link key={m.marketId} href={`/markets/${m.marketId}`} className="card">
            <h2 style={{ marginBottom: '0.25rem' }}>{m.title ?? `Prophecy ${m.marketId}`}</h2>
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              {m.resolutionState === 'open' ? 'open' : m.resolutionState ?? 'unknown'}
              {typeof m.poolBalance === 'number' && (
                <>
                  {' · '}
                  <span className="coin" aria-hidden />
                  {m.poolBalance.toFixed(2)}
                </>
              )}
              {typeof m.participantCount === 'number' && ` · ${m.participantCount} seers`}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
