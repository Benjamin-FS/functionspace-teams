'use client';

import Link from 'next/link';
import type { MarketState } from '@functionspace/core';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { teamPayoffCurve, type TeamMarketAggregate } from '@/lib/aggregate';

export function TeamMarketCard({
  market,
  aggregate,
  rationales = {},
}: {
  market: MarketState;
  aggregate: TeamMarketAggregate;
  rationales?: Record<string, string>;
}) {
  const { numBuckets, lowerBound, upperBound } = market.config;
  const step = (upperBound - lowerBound) / numBuckets;

  const beliefData = Array.from({ length: numBuckets }, (_, i) => ({
    outcome: lowerBound + (i + 0.5) * step,
    market: market.consensus[i] ?? 0,
    team: aggregate.teamBelief[i] ?? 0,
  }));

  const payoff = teamPayoffCurve(market, aggregate.contributions);

  const fmt = (v: number) =>
    market.decimals != null ? v.toFixed(market.decimals) : v.toFixed(2);

  return (
    <div className="card">
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>
            <Link href={`/markets/${market.marketId}`}>{market.title}</Link>
          </h2>
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            pool <span className="coin" aria-hidden />{market.poolBalance.toFixed(2)} · {market.positionsOpen} open ·{' '}
            augury {fmt(market.consensusMean)} {market.xAxisUnits}
          </p>
        </div>
        <div className="muted" style={{ fontSize: '0.85rem' }}>
          guild pledge <span className="coin" aria-hidden />{aggregate.totalCollateral.toFixed(2)}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.25rem' }}>The Augury · Market vs Guild</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={beliefData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="rgba(201,161,61,0.12)" strokeDasharray="3 3" />
              <XAxis
                dataKey="outcome"
                stroke="#8b7b5a"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => fmt(v)}
              />
              {/* Dual Y axes: realm and guild beliefs scale independently so
                  their shapes are comparable. Both are L1-normalised PDFs but
                  the guild's mixture can be far more concentrated than the
                  market's, so a shared axis would flatten the realm line. */}
              <YAxis yAxisId="realm" stroke="#5a8fc2" tick={{ fontSize: 10 }} width={32} tickFormatter={(v) => v.toFixed(2)} />
              <YAxis yAxisId="guild" stroke="#c9a13d" tick={{ fontSize: 10 }} width={32} orientation="right" tickFormatter={(v) => v.toFixed(2)} />
              <Tooltip
                contentStyle={{ background: '#14100a', border: '1px solid #7c5f1e', color: '#e6d6ad' }}
                formatter={(v: number, k) => [v.toFixed(4), k]}
                labelFormatter={(v: number) => `${fmt(v)} ${market.xAxisUnits ?? ''}`}
              />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              <Line yAxisId="realm" type="monotone" dataKey="market" name="Realm (left axis)" stroke="#5a8fc2" dot={false} strokeWidth={2} />
              <Line yAxisId="guild" type="monotone" dataKey="team" name="Guild (right axis)" stroke="#f1d472" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 style={{ marginBottom: '0.25rem' }}>Spoils Foretold by Outcome</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={payoff} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="rgba(201,161,61,0.12)" strokeDasharray="3 3" />
              <XAxis
                dataKey="outcome"
                stroke="#8b7b5a"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => fmt(v)}
              />
              <YAxis stroke="#8b7b5a" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(0)}`} />
              <Tooltip
                contentStyle={{ background: '#14100a', border: '1px solid #7c5f1e', color: '#e6d6ad' }}
                formatter={(v: number) => [`${v.toFixed(2)}`, 'guild spoils']}
                labelFormatter={(v: number) => `${fmt(v)} ${market.xAxisUnits ?? ''}`}
              />
              <Line type="monotone" dataKey="payoff" stroke="#c83232" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
            The sum of each member's spoils at the chosen outcome, drawn against
            the present pool.
          </p>
        </div>
      </div>

      <h3 style={{ marginTop: '1.25rem', marginBottom: '0.4rem' }}>Pledges of the Fellowship</h3>
      <table className="simple">
        <thead>
          <tr>
            <th>member</th>
            <th>pledge</th>
            <th>share</th>
            <th>seal</th>
          </tr>
        </thead>
        <tbody>
          {aggregate.contributions.map((c) => {
            const r = rationales[c.positionId];
            return (
              <tr key={c.positionId}>
                <td>
                  {c.username}
                  {r && (
                    <div className="muted" style={{ fontStyle: 'italic', fontSize: '0.85rem', marginTop: '0.2rem', paddingLeft: '0.6rem', borderLeft: '2px solid var(--blood)' }}>
                      “{r}”
                    </div>
                  )}
                </td>
                <td><span className="coin" aria-hidden /> {c.collateral.toFixed(2)}</td>
                <td>{((c.collateral / Math.max(aggregate.totalCollateral, 1e-9)) * 100).toFixed(1)}%</td>
                <td className="muted" style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem' }}>{c.positionId}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
