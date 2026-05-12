import Link from 'next/link';
import { timeAgo } from '@/lib/timeAgo';

export interface FeedEntry {
  positionId: string;
  username: string;
  marketId: number;
  marketTitle: string | null;
  collateral: number;
  rationale: string | null;
  createdAt: Date;
}

export function ActivityFeed({ entries }: { entries: FeedEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="muted">
        No bets yet. Place one and it'll show up here.
      </p>
    );
  }
  return (
    <ul className="feed">
      {entries.map((e) => (
        <li key={e.positionId}>
          <div className="feed-avatar">
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
              <circle cx="12" cy="9" r="3.5" />
              <path d="M5 20 Q5 14 12 14 Q19 14 19 20" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div>
              <span className="who">{e.username}</span>{' '}
              <span className="muted">bet</span>{' '}
              <span className="coin" aria-hidden /> {e.collateral.toFixed(2)}{' '}
              <span className="muted">on</span>{' '}
              <Link href={`/markets/${e.marketId}`}>
                {e.marketTitle ?? `Market ${e.marketId}`}
              </Link>
            </div>
            {e.rationale && (
              <div className="rationale">“{e.rationale}”</div>
            )}
          </div>
          <div className="when">{timeAgo(e.createdAt)}</div>
        </li>
      ))}
    </ul>
  );
}
