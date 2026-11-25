import { describe, expect, it } from 'vitest';
import { applyGameResult, EMPTY_STATISTICS } from '../src/statistics';

describe('statistics aggregation', () => {
  it('counts a completed game and calculates its average', () => {
    const result = applyGameResult(
      EMPTY_STATISTICS,
      { score: 1200, highestTile: 256, won: false, lost: true },
      0,
    );

    expect(result.totalScore).toBe(1200);
    expect(result.statistics).toEqual({
      totalGamesPlayed: 1,
      totalGamesWon: 0,
      totalGamesLost: 1,
      bestScore: 1200,
      highestTile: 256,
      averageScore: 1200,
    });
  });

  it('can count a game as both won and lost without double-counting games played', () => {
    const result = applyGameResult(
      EMPTY_STATISTICS,
      { score: 8000, highestTile: 2048, won: true, lost: true },
      0,
    );

    expect(result.statistics.totalGamesPlayed).toBe(1);
    expect(result.statistics.totalGamesWon).toBe(1);
    expect(result.statistics.totalGamesLost).toBe(1);
  });

  it('retains best score and highest tile while averaging all finished games', () => {
    const first = applyGameResult(
      EMPTY_STATISTICS,
      { score: 1000, highestTile: 512, won: true, lost: false },
      0,
    );
    const second = applyGameResult(
      first.statistics,
      { score: 500, highestTile: 256, won: false, lost: true },
      first.totalScore,
    );

    expect(second.statistics.bestScore).toBe(1000);
    expect(second.statistics.highestTile).toBe(512);
    expect(second.statistics.averageScore).toBe(750);
  });
});
