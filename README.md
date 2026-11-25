# Neon Fusion — 2048

A local-first, bilingual 2048 game built with a pure TypeScript engine, React, Phaser 3, SQLite WASM, Bun, and Elysia.

## Features

- Classic 4×4 gameplay with deterministic, injectable RNG
- Arrow-key, WASD, and touch-swipe input
- Unlimited undo within the current game
- One-time 2048 victory dialog with continued play
- English and Thai interfaces with persisted language selection
- Six local statistics stored with SQLite WASM and kvvfs
- Safe session-memory fallback when browser storage is unavailable or full
- Cross-tab refresh using Web Locks, storage events, and BroadcastChannel
- Responsive neon interface with visible focus and reduced-motion support
- Versioned Elysia health API; no player data is sent to the backend

## Requirements

- Bun 1.4.3 or newer
- A modern browser with WebAssembly, localStorage, and Web Locks

## Run locally

```powershell
bun install
bun run dev:api
```

In a second terminal:

```powershell
bun run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` to Elysia on port `3000`.

## Scripts

| Command | Purpose |
|---|---|
| `bun run dev` | Start the Vite frontend |
| `bun run dev:api` | Start the Bun/Elysia API with watch mode |
| `bun run typecheck` | Type-check every workspace in strict mode |
| `bun run test` | Run engine, storage, React, and API tests |
| `bun run test:e2e` | Run Playwright browser tests |
| `bun run build` | Build the static frontend into `apps/web/dist` |
| `bun run check` | Run type checks, tests, and the production build |

Install the Playwright browser once before running E2E tests:

```powershell
bunx playwright install chromium
```

## Workspace layout

```text
packages/core       Pure TypeScript 2048 rules, RNG, and state transitions
packages/storage    SQLite WASM/kvvfs statistics store and aggregation
apps/web            React UI, Phaser board, translations, and browser integration
apps/api            Bun/Elysia health API
e2e                 Playwright browser coverage
```

`packages/core` has no React, Phaser, DOM, or Browser API imports.

## Game behavior

- The board is always 4×4 and empty cells are `0`.
- Equal adjacent tiles merge once per move.
- Every merge adds the new tile value to the score.
- A valid move spawns `2` with 90% probability or `4` with 10% probability.
- Invalid moves do not spawn tiles, change score, or create undo history.
- Reaching `2048` opens the victory dialog once per game.
- Play can continue after victory.
- A new game clears the previous game's undo history.
- Undo is available after game over and never rewrites already-recorded statistics.

## Statistics and persistence

The SQLite schema stores total games played, won, lost, best score, highest tile, and an internal total score used to calculate the average.

Implemented semantics:

- A game is recorded when it ends or when the player explicitly finishes from the victory dialog.
- A game that reaches `2048` and later loses counts as both won and lost, but only once in games played.
- Best score, highest tile, and average score are based on recorded games.
- Undo does not reverse a recorded result.
- Starting a new game during active play abandons that game without recording it.
- The current board and undo history are not restored after a reload.
- Clearing site data removes local records; permanence is not promised.

If SQLite cannot initialize, a write exceeds quota, or stored data cannot be read, the app switches to session-memory statistics and remains playable. A bilingual banner explains the degraded state.

Language selection uses the separate `neon-fusion-language` localStorage key and is never stored in SQLite.

## API and production configuration

Backend endpoints:

```text
GET  /api/v1/health         Service health and version metadata
GET  /api/v1/leaderboard    Global top scores per game mode
POST /api/v1/leaderboard    Submit game score to global leaderboard
```

Copy `.env.example` to `.env` and adjust:

| Variable | Purpose |
|---|---|
| `PORT` | Elysia port, default `3000` |
| `CORS_ORIGIN` | Comma-separated allowed origins or `*` |
| `VITE_API_BASE_URL` | Absolute API origin for production, such as `https://api.example.com` |

Build the frontend with `bun run build`, then deploy `apps/web/dist` with any static host. Deploy `apps/api` separately as a Bun service or container. The frontend remains playable when the API is offline.

## CI/CD & Deployment

### GitHub Actions CI

Automated checks run on every `push` and `pull_request` targeting `main`:

- **Typecheck & Unit Tests**: Strict TypeScript checking across all workspaces and 37 Vitest unit tests
- **Static Build**: Production bundling into `apps/web/dist`
- **E2E Tests**: Playwright browser test suite with automatic Chromium installation and artifact reporting

### Deployment Options

#### 1. Frontend: Cloudflare Pages
Build the static bundle and deploy with Wrangler:
```bash
bun run build
npx wrangler pages deploy apps/web/dist --project-name neon-fusion-2048
```
SPA routing and asset headers are configured in `apps/web/public/_redirects` and `apps/web/public/_headers`.

#### 2. Frontend: Vercel
Deploy static frontend using Vercel CLI:
```bash
npx vercel --prod
```
Configuration is stored in `vercel.json` (auto-detects `bun run build` and outputs `apps/web/dist`).

#### 3. Backend: Google Cloud Run
Deploy the Elysia container to Cloud Run in one command:
```bash
gcloud run deploy neon-fusion-api \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars CORS_ORIGIN="*"
```

#### 4. Full Stack: Docker Compose
Run both the API and Web frontend with Nginx reverse proxy locally:
```bash
docker compose up --build -d
```
- Web: `http://localhost:8080`
- API: `http://localhost:3000`

#### 5. Interactive Deployment Script
Use the cross-platform deployment helper:
- **Windows**: `powershell -ExecutionPolicy Bypass -File ./scripts/deploy.ps1`
- **macOS/Linux**: `bash ./scripts/deploy.sh`

## Verification

The test suite covers:

- Movement in all four directions
- Single-merge-per-move behavior
- Score changes and invalid moves
- Deterministic 90/10 spawning
- Win, continued play, and loss detection
- Unlimited undo and state immutability
- Statistics aggregation and storage fallback
- React navigation and Thai localization
- API health, 404 handling, and CORS
- Real browser keyboard play, undo, SQLite kvvfs initialization, mobile layout, and dev proxy
