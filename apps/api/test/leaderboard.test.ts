import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

describe('leaderboard API', () => {
  it('returns leaderboard entries for a given mode', async () => {
    const app = createApp();
    const response = await app.handle(new Request('http://localhost/api/v1/leaderboard?mode=classic'));

    expect(response.status).toBe(200);
    const data = (await response.json()) as { mode: string; entries: Array<{ playerName: string; score: number }> };
    expect(data.mode).toBe('classic');
    expect(Array.isArray(data.entries)).toBe(true);
    expect(data.entries.length).toBeGreaterThan(0);
    expect(data.entries[0]).toHaveProperty('playerName');
    expect(data.entries[0]).toHaveProperty('score');
  });

  it('allows submitting a new score and returns rank', async () => {
    const app = createApp();
    const response = await app.handle(
      new Request('http://localhost/api/v1/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: 'Alice',
          score: 99999,
          highestTile: 4096,
          mode: 'classic',
        }),
      }),
    );

    expect(response.status).toBe(201);
    const data = (await response.json()) as {
      success: boolean;
      rank: number;
      record: { playerName: string; score: number };
    };
    expect(data.success).toBe(true);
    expect(data.rank).toBe(1);
    expect(data.record.playerName).toBe('Alice');
    expect(data.record.score).toBe(99999);
  });
});
