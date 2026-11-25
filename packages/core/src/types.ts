export const BOARD_SIZE = 4 as const;
export const WINNING_TILE = 2048 as const;

export type Tile = number;
export type Board = readonly (readonly Tile[])[];
export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameStatus = 'playing' | 'won' | 'over';
export type GameMode = 'classic' | '5x5' | 'time-attack' | 'practice';

export interface Position {
  readonly row: number;
  readonly col: number;
}

export interface GameSnapshot {
  readonly board: Board;
  readonly score: number;
  readonly moveCount: number;
  readonly hasWon: boolean;
  readonly winPresented: boolean;
  readonly status: GameStatus;
  readonly mode?: GameMode | undefined;
}

export interface GameState extends GameSnapshot {
  readonly history: readonly GameSnapshot[];
}

export interface MoveResult {
  readonly state: GameState;
  readonly changed: boolean;
  readonly scoreGained: number;
  readonly merged: readonly Position[];
  readonly spawned: Position | null;
  readonly wonNow: boolean;
}

export type RandomSource = () => number;
