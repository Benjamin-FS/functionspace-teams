'use client';

import { useState } from 'react';
import { ConsensusChart, TradePanel, PositionTable, MarketStats } from '@functionspace/ui';
import type { BuyResult } from '@functionspace/core';

export function MarketDetail({
  marketId,
  username,
  myTeams,
}: {
  marketId: number;
  username: string | null;
  myTeams: Array<{ id: string; name: string }>;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('none');
  const [rationale, setRationale] = useState('');
  const [tagResult, setTagResult] = useState<string | null>(null);

  async function onBuy(result: BuyResult) {
    setTagResult(null);
    if (selectedTeamId === 'none' || !username) return;
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId: result.positionId,
          teamId: selectedTeamId,
          marketId,
          collateral: result.collateral,
          rationale: rationale.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setTagResult(`The seal would not take: ${data.error ?? res.statusText}`);
        return;
      }
      const team = myTeams.find((t) => t.id === selectedTeamId);
      setTagResult(`Wager pledged to ${team?.name ?? 'the guild'}.`);
      setRationale('');
    } catch (err) {
      setTagResult(`The seal would not take: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const showRationale = selectedTeamId !== 'none' && !!username;

  return (
    <>
      <MarketStats marketId={marketId} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem', marginTop: '1rem' }}>
        <ConsensusChart marketId={marketId} height={500} zoomable />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {username ? (
            <div className="card">
              <h2 style={{ marginBottom: '0.5rem' }}>Bear a Banner</h2>
              <p className="muted" style={{ fontSize: '0.85rem', marginTop: 0 }}>
                Mark the next wager with a guild. Unmarked wagers stand to thy
                name alone.
              </p>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="team-picker"
              >
                <option value="none">— mine own banner —</option>
                {myTeams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {myTeams.length === 0 && (
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Thou hast sworn to no guild yet.
                </p>
              )}
              {showRationale && (
                <div style={{ marginTop: '0.85rem' }}>
                  <label style={{
                    display: 'block',
                    fontFamily: 'var(--serif)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: '0.3rem',
                  }}>
                    Thy Reasoning <span className="muted" style={{ letterSpacing: 'normal', textTransform: 'none', fontFamily: 'var(--body)', fontSize: '0.8rem' }}>(optional, will be sealed onto this wager)</span>
                  </label>
                  <textarea
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value.slice(0, 240))}
                    rows={2}
                    placeholder="The iphone numbers leaked. Trust me."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.7rem',
                      background: 'linear-gradient(180deg, #0a0805, #14100a)',
                      border: '1px solid var(--gold-dim)',
                      color: 'var(--ink)',
                      fontFamily: 'var(--body)',
                      fontSize: '0.95rem',
                      borderRadius: 2,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.7)',
                      resize: 'vertical',
                    }}
                  />
                  <div className="muted" style={{ fontSize: '0.75rem', textAlign: 'right', marginTop: '0.15rem' }}>
                    {rationale.length}/240
                  </div>
                </div>
              )}
              {tagResult && (
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--gold-bright)' }}>{tagResult}</p>
              )}
            </div>
          ) : (
            <div className="card">
              <p className="muted">Enter the realm to wager.</p>
            </div>
          )}
          <TradePanel marketId={marketId} modes={['gaussian', 'range']} onBuy={onBuy} />
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <PositionTable marketId={marketId} />
      </div>
    </>
  );
}
