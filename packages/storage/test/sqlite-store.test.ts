import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStatisticsStore, EMPTY_STATISTICS } from '../src';

const mocks = vi.hoisted(() => ({
  initialize: vi.fn(),
  row: {
    total_games_played: 0,
    total_games_won: 0,
    total_games_lost: 0,
    best_score: 0,
    highest_tile: 0,
    total_score: 0,
  },
  failWrite: false,
}));

vi.mock('@sqlite.org/sqlite-wasm', () => ({ default: mocks.initialize }));

function databaseModule(): unknown {
  class FakeDatabase {
    exec(sql: string, bind?: readonly unknown[]): void {
      if (mocks.failWrite && sql.includes('UPDATE statistics SET')) {
        throw new Error('Storage quota exceeded.');
      }
      if (sql.includes('UPDATE statistics SET') && !bind) {
        Object.assign(mocks.row, {
          total_games_played: 0,
          total_games_won: 0,
          total_games_lost: 0,
          best_score: 0,
          highest_tile: 0,
          total_score: 0,
        });
      }
      if (sql.includes('UPDATE statistics SET') && bind) {
        const keys = [
          'total_games_played',
          'total_games_won',
          'total_games_lost',
          'best_score',
          'highest_tile',
          'total_score',
        ] as const;
        keys.forEach((key, index) => {
          mocks.row[key] = Number(bind[index]);
        });
      }
    }

    selectObjects(): Record<string, unknown>[] {
      return [{ ...mocks.row }];
    }

    selectValue(): number {
      return 0;
    }

    close(): void {}
  }

  return { oo1: { JsStorageDb: FakeDatabase } };
}

describe('SQLite statistics store', () => {
  beforeEach(() => {
    Object.assign(mocks.row, {
      total_games_played: 0,
      total_games_won: 0,
      total_games_lost: 0,
      best_score: 0,
      highest_tile: 0,
      total_score: 0,
    });
    mocks.failWrite = false;
    mocks.initialize.mockReset().mockResolvedValue(databaseModule());
    vi.stubGlobal('BroadcastChannel', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initializes the local kvvfs database and reports availability', async () => {
    const store = createStatisticsStore();
    await store.initialize();

    expect(mocks.initialize).toHaveBeenCalledTimes(1);
    expect(store.getStatus()).toEqual({ mode: 'sqlite', available: true });
    expect(store.getStatistics()).toEqual(EMPTY_STATISTICS);
    store.close();
  });

  it('persists aggregated game results', async () => {
    const store = createStatisticsStore();
    await store.initialize();
    await store.recordGame({ score: 2048, highestTile: 1024, won: true, lost: false });
    await store.recordGame({ score: 512, highestTile: 128, won: false, lost: true });

    expect(store.getStatistics()).toEqual({
      totalGamesPlayed: 2,
      totalGamesWon: 1,
      totalGamesLost: 1,
      bestScore: 2048,
      highestTile: 1024,
      averageScore: 1280,
    });
    expect(mocks.row.total_score).toBe(2560);
    store.close();
  });

  it('falls back to session memory when SQLite cannot initialize', async () => {
    mocks.initialize.mockRejectedValue(new Error('WASM unavailable.'));
    const store = createStatisticsStore();
    await store.initialize();
    await store.recordGame({ score: 100, highestTile: 32, won: false, lost: true });

    expect(store.getStatus()).toEqual({ mode: 'memory', available: false });
    expect(store.getStatistics().totalGamesPlayed).toBe(1);
    expect(store.getStatistics().bestScore).toBe(100);
    store.close();
  });

  it('keeps playing and retains session stats after a storage write fails', async () => {
    const store = createStatisticsStore();
    await store.initialize();
    mocks.failWrite = true;
    await store.recordGame({ score: 300, highestTile: 64, won: false, lost: true });

    expect(store.getStatus()).toEqual({ mode: 'memory', available: false });
    expect(store.getStatistics().averageScore).toBe(300);
    store.close();
  });

  it('rejects invalid scores without changing statistics', async () => {
    const store = createStatisticsStore();
    await store.initialize();

    await expect(
      store.recordGame({ score: -1, highestTile: 2, won: false, lost: true }),
    ).rejects.toThrow(RangeError);
    expect(store.getStatistics()).toEqual(EMPTY_STATISTICS);
    store.close();
  });

  it('resets persisted and in-memory aggregates', async () => {
    const store = createStatisticsStore();
    await store.initialize();
    await store.recordGame({ score: 400, highestTile: 64, won: false, lost: true });
    await store.resetStatistics();

    expect(store.getStatistics()).toEqual(EMPTY_STATISTICS);
    expect(mocks.row.total_score).toBe(0);
    store.close();
  });
});
