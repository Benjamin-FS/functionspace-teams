# Guild of Predictors

A Next.js app that lets users form teams on top of the
[functionSPACE](https://docs.functionspace.dev) prediction-market SDK and renders
their combined positions as one team-level view.

This is a **proof of concept**. The SDK has no team or transfer primitives today,
so this PoC is **aggregation-only**: each member places their own real bets
through their own functionSPACE account, the site groups them into teams, and
shows the aggregate. True pooled payouts — where a member with the wrong
individual bet still profits from the team's overall position — needs an
on-chain wrapper that doesn't exist yet. When that ships, the UI here is the
natural client.

## What works today

- Passwordless log in with a functionSPACE username (new usernames auto-signed up)
- Create a team, share an invite code, members join with one click
- Place a real bet on any market and tag it to one of your teams
- Team page shows roster, total team stake, collateral-weighted belief PDF
  (market vs team), and a projected per-outcome team-payoff curve
- Leaderboard ranks teams by total stake

## Requirements

- Node.js 18+
- `../fs_trading_sdk` checked out next to this repo (npm workspaces points at
  it directly — see `package.json`)

## Setup

```bash
cp .env.example .env
# edit .env: set NEXT_PUBLIC_FUNCTIONSPACE_API_URL to a real backend
# and replace SESSION_PASSWORD with a 32+ char random string

npm install            # links the three @functionspace/* packages from the SDK repo
npx prisma migrate dev # creates prisma/dev.db
npm run dev            # http://localhost:3000
```

## How the SDK is linked

The three SDK packages ship as TypeScript source under npm workspaces and are
not on npm. This app declares them as workspaces in its own `package.json`,
which symlinks them into `node_modules/@functionspace/*`:

```json
"workspaces": [
  "../fs_trading_sdk/packages/core",
  "../fs_trading_sdk/packages/react",
  "../fs_trading_sdk/packages/ui"
]
```

`next.config.mjs` then teaches webpack how to consume that source: it
transpiles the three packages, resolves `./foo.js` imports against `.ts`
files, and resolves third-party deps (`rc-slider`, `react`, etc.) from this
app's `node_modules` regardless of where the importing source file lives.

## Architecture

- **Auth**: server-side `loginUser` / `signupUser` against the FS API, token
  stored in an iron-session HTTP-only cookie. A `<TokenInjector>` reads the
  token from session-derived props and pushes it into the React provider's
  `FSClient` via `setToken`, so client-side hooks (`useMarket`, `useBuy`, …)
  see an authenticated client without ever shipping the password to the
  browser.
- **DB**: SQLite via Prisma. Three tables: `Team`, `TeamMembership`,
  `TradeTag`. We don't duplicate FS state — the `TradeTag` row just maps an
  FS `positionId` to a `teamId` + member contribution.
- **Trade tagging**: the market page renders the SDK's `<TradePanel>` and
  hooks its `onBuy` callback. On a successful buy the position id is POSTed
  to `/api/trades` with the selected team. Untagged buys go to your personal
  positions and aren't visible on team pages.
- **Aggregation** (`src/lib/aggregate.ts`):
  - `teamBelief[i] = Σ (collateral_j / totalCollateral) · belief_j[i]` — a
    stake-weighted mixture of member beliefs.
  - `teamPayoffAt(b)` approximates each member's projected payoff at bucket
    `b` from their stored position belief, claims, and the market's current
    `consensus` / `totalMass` / `poolBalance`, then sums across members.
    Heuristic and chart-only; settlement values will come from the SDK once
    the backend implements them.

## Routes

- `/` home: your teams + leaderboard
- `/login`, `/signup`
- `/teams` browse all teams + create / join
- `/teams/[id]` team detail (roster + per-market aggregates)
- `/markets` market discovery
- `/markets/[id]` market detail with team-tagged trading
- `/api/{auth,teams,trades}/...` backing routes

## Known limits

- Settlement: the SDK doesn't expose claim/redeem yet. `settlementPayout` is
  always `null`. Payoff curves on team pages are projections at the current
  pool, not realised P&L.
- One trade tags exactly one team. No splitting across teams.
- No real-time refresh on the team detail page; navigate back after a trade
  to see it appear.
- The `.env` placeholder URL won't serve markets; set a real backend.
