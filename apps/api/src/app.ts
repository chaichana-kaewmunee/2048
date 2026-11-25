import { cors } from '@elysiajs/cors';
import { Elysia, t } from 'elysia';
import { leaderboardStore } from './leaderboard';

export function createApp() {
  const allowedOrigins = (process.env.CORS_ORIGIN ?? '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Elysia()
    .use(
      cors({
        origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
      }),
    )
    .get('/api/v1/health', () => ({
      status: 'ok',
      service: 'neon-fusion-api',
      version: '1.0.0',
    }))
    .get(
      '/api/v1/leaderboard',
      ({ query }) => {
        const mode = (query.mode as string) || 'classic';
        const limit = query.limit ? Number(query.limit) : 20;
        const entries = leaderboardStore.getLeaderboard(mode, limit);
        return {
          mode,
          entries,
        };
      },
      {
        query: t.Object({
          mode: t.Optional(t.String()),
          limit: t.Optional(t.String()),
        }),
      },
    )
    .post(
      '/api/v1/leaderboard',
      ({ body, set }) => {
        const result = leaderboardStore.addScore({
          playerName: body.playerName,
          score: body.score,
          highestTile: body.highestTile,
          mode: body.mode,
        });
        set.status = 201;
        return {
          success: true,
          rank: result.rank,
          record: result.record,
        };
      },
      {
        body: t.Object({
          playerName: t.String(),
          score: t.Number(),
          highestTile: t.Number(),
          mode: t.Optional(t.String()),
        }),
      },
    )
    .onError(({ code, set }) => {
      if (code === 'NOT_FOUND') {
        set.status = 404;
        return { error: 'not_found' };
      }
      set.status = 500;
      return { error: 'internal_error' };
    });
}
