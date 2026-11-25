export interface PlayerStatistics {
  readonly totalGamesPlayed: number;
  readonly totalGamesWon: number;
  readonly totalGamesLost: number;
  readonly bestScore: number;
  readonly highestTile: number;
  readonly averageScore: number;
}

export interface GameResult {
  readonly score: number;
  readonly highestTile: number;
  readonly won: boolean;
  readonly lost: boolean;
}

export type StorageMode = 'sqlite' | 'memory';

export interface StorageStatus {
  readonly mode: StorageMode;
  readonly available: boolean;
}

export interface StatisticsStore {
  initialize(): Promise<void>;
  getStatistics(): PlayerStatistics;
  getStatus(): StorageStatus;
  recordGame(result: GameResult): Promise<void>;
  resetStatistics(): Promise<void>;
  refresh(): Promise<void>;
  subscribe(listener: () => void): () => void;
  close(): void;
}
