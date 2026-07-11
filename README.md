# Portfolio Deck

Single-page command dashboard for the manazoid4 portfolio. Pulls repos from the
GitHub API, shows last-push recency (green <48h, amber <14d, red stale), open PR
counts, and deploy status. FlowLens, JobFilterV1, and inkweave pinned on top.

## Design direction

Operator deck: dark terminal aesthetic (matches MAZos), monospace, one screen,
zero client JS. The hero signal is *staleness* — the dashboard's job is answering
"what needs attention" in one glance, so recency dots carry the layout and
everything else stays quiet. Server components + 5-minute ISR; the page is
static-fast and never spins a loader.

## Run

```bash
npm install
cp .env.example .env.local   # set GITHUB_TOKEN (optional but recommended)
npm run dev
```

## Deploy (Vercel)

Import the repo, set one env var: `GITHUB_TOKEN` (fine-grained read-only or
classic `repo` scope for private repos). No other config.

Without a token the app still works on public repos at anonymous rate limits
(PR counts may show 0 when the search API throttles).
