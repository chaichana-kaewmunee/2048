import { applyGameResult, EMPTY_STATISTICS } from './statistics';
import type {
  GameResult,
  PlayerStatistics,
  StatisticsStore,
  StorageMode,
  StorageStatus,
} from './types';

const DATABASE_NAME = 'neon-fusion-2048';
const CHANNEL_NAME = 'neon-fusion-statistics';
const SCHEMA_VERSION = 1;

interface SqliteDatabase {
  exec(sql: string, bind?: readonly unknown[]): unknown;
  selectObjects(sql: string): Record<string, unknown>[];
  selectValue(sql: string): unknown;
  close(): void;
}

interface SqliteModule {
  oo1: {
    JsStorageDb: new (storage: 'local' | 'session') => SqliteDatabase;
  };
}

type SqliteInitializer = () => Promise<SqliteModule>;

function withStorageLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request(DATABASE_NAME, operation);
  }
  return operation();
}

function parseStatistics(row: Record<string, unknown> | undefined, totalScore: number): PlayerStatistics {
  const played = Number(row?.total_games_played ?? 0);
  return {
    totalGamesPlayed: played,
    totalGamesWon: Number(row?.total_games_won ?? 0),
    totalGamesLost: Number(row?.total_games_lost ?? 0),
    bestScore: Number(row?.best_score ?? 0),
    highestTile: Number(row?.highest_tile ?? 0),
    averageScore: played > 0 ? totalScore / played : 0,
  };
}

export function createStatisticsStore(): StatisticsStore {
  let database: SqliteDatabase | null = null;
  let mode: StorageMode = 'memory';
  let statistics: PlayerStatistics = EMPTY_STATISTICS;
  let totalScore = 0;
  let initialization: Promise<void> | null = null;
  let channel: BroadcastChannel | null = null;
  const listeners = new Set<() => void>();

  const notify = (): void => {
    listeners.forEach((listener) => listener());
  };

  const getStatus = (): StorageStatus => ({ mode, available: mode === 'sqlite' });

  const useMemoryFallback = (): void => {
    if (database) {
      try {
        database.close();
      } catch {
        // The game remains playable even when a broken database cannot close cleanly.
      }
    }
    database = null;
    mode = 'memory';
    notify();
  };

  const initializeOnce = async (): Promise<void> => {
    await withStorageLock(async () => {
      try {
        const initializer = (await import('@sqlite.org/sqlite-wasm')).default as unknown as SqliteInitializer;
        const sqlite = await initializer();
        if (!sqlite.oo1?.JsStorageDb) {
          throw new Error('SQLite kvvfs is unavailable in this browser.');
        }

        database = new sqlite.oo1.JsStorageDb('local');
        database.exec(`
          PRAGMA journal_mode = MEMORY;
          CREATE TABLE IF NOT EXISTS statistics (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            total_games_played INTEGER NOT NULL DEFAULT 0,
            total_games_won INTEGER NOT NULL DEFAULT 0,
            total_games_lost INTEGER NOT NULL DEFAULT 0,
            best_score INTEGER NOT NULL DEFAULT 0,
            highest_tile INTEGER NOT NULL DEFAULT 0,
            total_score INTEGER NOT NULL DEFAULT 0
          );
          INSERT OR IGNORE INTO statistics (id) VALUES (1);
        `);

        const version = Number(database.selectValue('PRAGMA user_version'));
        if (version > SCHEMA_VERSION) {
          throw new Error('This statistics database uses a newer schema.');
        }
        database.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);

        const [row] = database.selectObjects('SELECT * FROM statistics WHERE id = 1');
        totalScore = Number(row?.total_score ?? 0);
        statistics = parseStatistics(row, totalScore);
        mode = 'sqlite';

        if (typeof BroadcastChannel !== 'undefined') {
          channel = new BroadcastChannel(CHANNEL_NAME);
          channel.onmessage = () => {
            void refresh();
          };
        }
        notify();
      } catch {
        useMemoryFallback();
      }
    });
  };

  const refresh = async (): Promise<void> => {
    await withStorageLock(async () => {
      if (!database) {
        return;
      }
      try {
        const [row] = database.selectObjects('SELECT * FROM statistics WHERE id = 1');
        totalScore = Number(row?.total_score ?? 0);
        statistics = parseStatistics(row, totalScore);
        notify();
      } catch {
        useMemoryFallback();
      }
    });
  };

  return {
    initialize: () => {
      initialization ??= initializeOnce();
      return initialization;
    },
    getStatistics: () => statistics,
    getStatus,
    recordGame: async (result: GameResult) => {
      if (!Number.isSafeInteger(result.score) || result.score < 0) {
        throw new RangeError('Score must be a non-negative safe integer.');
      }
      if (!Number.isSafeInteger(result.highestTile) || result.highestTile < 0) {
        throw new RangeError('Highest tile must be a non-negative safe integer.');
      }

      await withStorageLock(async () => {
        try {
          if (database) {
            const [row] = database.selectObjects('SELECT * FROM statistics WHERE id = 1');
            const currentTotal = Number(row?.total_score ?? 0);
            const updated = applyGameResult(parseStatistics(row, currentTotal), result, currentTotal);
            database.exec(
              `UPDATE statistics SET
                total_games_played = ?,
                total_games_won = ?,
                total_games_lost = ?,
                best_score = ?,
                highest_tile = ?,
                total_score = ?
               WHERE id = 1;`,
              [
                updated.statistics.totalGamesPlayed,
                updated.statistics.totalGamesWon,
                updated.statistics.totalGamesLost,
                updated.statistics.bestScore,
                updated.statistics.highestTile,
                updated.totalScore,
              ],
            );
            totalScore = updated.totalScore;
            statistics = updated.statistics;
          } else {
            const updated = applyGameResult(statistics, result, totalScore);
            statistics = updated.statistics;
            totalScore = updated.totalScore;
          }
          channel?.postMessage('updated');
          notify();
        } catch {
          const updated = applyGameResult(statistics, result, totalScore);
          statistics = updated.statistics;
          totalScore = updated.totalScore;
          useMemoryFallback();
        }
      });
    },
    resetStatistics: async () => {
      await withStorageLock(async () => {
        try {
          database?.exec(`
            UPDATE statistics SET
              total_games_played = 0,
              total_games_won = 0,
              total_games_lost = 0,
              best_score = 0,
              highest_tile = 0,
              total_score = 0
            WHERE id = 1;
          `);
          statistics = EMPTY_STATISTICS;
          totalScore = 0;
          channel?.postMessage('updated');
          notify();
        } catch {
          statistics = EMPTY_STATISTICS;
          totalScore = 0;
          useMemoryFallback();
        }
      });
    },
    refresh,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    close: () => {
      channel?.close();
      channel = null;
      if (database) {
        try {
          database.close();
        } catch {
          // Closing is best-effort during page teardown.
        }
      }
      database = null;
      listeners.clear();
    },
  };
}

let singleton: StatisticsStore | null = null;

export function getStatisticsStore(): StatisticsStore {
  singleton ??= createStatisticsStore();
  return singleton;
}
