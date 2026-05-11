import type { MarketState, Position } from '@functionspace/core';

export interface MemberContribution {
  username: string;
  collateral: number;
  belief: number[];
  claims: number;
  positionId: string;
}

export interface TeamMarketAggregate {
  marketId: number;
  totalCollateral: number;
  /**
   * Collateral-weighted mixture of member beliefs (L1-normalised).
   * teamBelief[i] = sum_j (collateral_j / totalCollateral) * belief_j[i]
   */
  teamBelief: number[];
  contributions: MemberContribution[];
}

/**
 * Aggregate per-member positions into one team view for a single market.
 * Beliefs are assumed already L1-normalised (probability vector across buckets).
 */
export function aggregateMarketPositions(
  marketId: number,
  positions: MemberContribution[],
): TeamMarketAggregate | null {
  if (positions.length === 0) return null;

  const numBuckets = positions[0].belief.length;
  const totalCollateral = positions.reduce((s, p) => s + p.collateral, 0);
  const teamBelief = new Array<number>(numBuckets).fill(0);

  if (totalCollateral > 0) {
    for (const p of positions) {
      const w = p.collateral / totalCollateral;
      for (let i = 0; i < numBuckets; i++) {
        teamBelief[i] += w * (p.belief[i] ?? 0);
      }
    }
  }

  return { marketId, totalCollateral, teamBelief, contributions: positions };
}

/**
 * Project the team's payoff if outcome falls in bucket `bucketIndex`.
 *
 * Per-position payoff at bucket b is approximated as:
 *   payoff_i(b) = claims_i * belief_i[b] * numBuckets / consensus[b]_team_share
 *
 * In a DPM-style market (whitepaper eq 11) the per-unit payout at outcome ω is
 * M / q(ω). Without basis-coefficient access we approximate per-position
 * exposure at b by `claims * belief[b] * numBuckets` (since L1-normalised
 * belief integrates to 1, multiplying by numBuckets converts probability to
 * density). The market-side per-unit price is then M / (totalMass * density),
 * so payoff ~= claims * density_i / density_total * M.
 *
 * We compute it via the simpler proxy: position's "share of mass" at bucket b
 * times the market's pool. This is a heuristic for the chart, NOT settlement.
 */
export function teamPayoffCurve(
  market: MarketState,
  contributions: MemberContribution[],
): Array<{ bucket: number; outcome: number; payoff: number }> {
  const { numBuckets, lowerBound, upperBound } = market.config;
  const step = (upperBound - lowerBound) / numBuckets;
  const M = market.poolBalance;
  const totalMass = market.totalMass || 1;

  const out: Array<{ bucket: number; outcome: number; payoff: number }> = [];
  for (let b = 0; b < numBuckets; b++) {
    const marketDensityAtB = market.consensus[b] ?? 0;
    if (marketDensityAtB <= 0) {
      out.push({ bucket: b, outcome: lowerBound + (b + 0.5) * step, payoff: 0 });
      continue;
    }
    let teamPayoff = 0;
    for (const p of contributions) {
      const positionDensityAtB = p.belief[b] ?? 0;
      // share-of-pool at outcome b that this position holds
      const positionShareOfMass = (positionDensityAtB * p.claims) / totalMass;
      teamPayoff += (positionShareOfMass / marketDensityAtB) * M;
    }
    out.push({ bucket: b, outcome: lowerBound + (b + 0.5) * step, payoff: teamPayoff });
  }
  return out;
}

export function positionToContribution(p: Position): MemberContribution {
  return {
    username: p.owner,
    collateral: p.collateral,
    belief: p.belief,
    claims: p.claims,
    positionId: String(p.positionId),
  };
}
