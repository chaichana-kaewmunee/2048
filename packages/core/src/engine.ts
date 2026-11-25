import { randomIndex } from './random';
import {
  BOARD_SIZE,
  WINNING_TILE,
  type Board,
  type Direction,
  type GameMode,
  type GameSnapshot,
  type GameState,
  type MoveResult,
  type Position,
  type RandomSource,
  type Tile,
} from './types';

interface LineResult {
  readonly tiles: Tile[];
  readonly gained: number;
  readonly mergedIndices: number[];
}

function cloneBoard(board: Board): Tile[][] {
  return board.map((row) => [...row]);
}

function lineFor(board: Board, direction: Direction, line: number): Tile[] {
  const size = board.length;
  if (direction === 'left') {
    return [...(board[line] ?? [])];
  }

  if (direction === 'right') {
    return [...(board[line] ?? [])].reverse();
  }

  const tiles: Tile[] = [];
  for (let index = 0; index < size; index += 1) {
    const row = direction === 'up' ? index : size - 1 - index;
    tiles.push(board[row]?.[line] ?? 0);
  }
  return tiles;
}

function positionFor(direction: Direction, line: number, index: number, size: number = BOARD_SIZE): Position {
  if (direction === 'left') {
    return { row: line, col: index };
  }
  if (direction === 'right') {
    return { row: line, col: size - 1 - index };
  }

  const row = direction === 'up' ? index : size - 1 - index;
  return { row, col: line };
}

function writeLine(board: Tile[][], direction: Direction, line: number, tiles: Tile[]): void {
  const size = board.length;
  tiles.forEach((tile, index) => {
    const position = positionFor(direction, line, index, size);
    const row = board[position.row];
    if (row) {
      row[position.col] = tile;
    }
  });
}

function slideLine(line: readonly Tile[], size: number = BOARD_SIZE): LineResult {
  const compacted = line.filter((tile) => tile !== 0);
  const tiles: Tile[] = [];
  const mergedIndices: number[] = [];
  let gained = 0;

  for (let index = 0; index < compacted.length; index += 1) {
    const current = compacted[index];
    const next = compacted[index + 1];

    if (current !== undefined && current === next) {
      const merged = current * 2;
      tiles.push(merged);
      gained += merged;
      mergedIndices.push(tiles.length - 1);
      index += 1;
    } else if (current !== undefined) {
      tiles.push(current);
    }
  }

  while (tiles.length < size) {
    tiles.push(0);
  }

  return { tiles, gained, mergedIndices };
}

function boardsEqual(left: Board, right: Board): boolean {
  return left.every((row, rowIndex) =>
    row.every((tile, colIndex) => tile === right[rowIndex]?.[colIndex]),
  );
}

function emptyPositions(board: Board): Position[] {
  const positions: Position[] = [];
  board.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile === 0) {
        positions.push({ row: rowIndex, col: colIndex });
      }
    });
  });
  return positions;
}

function spawnTile(board: Board, random: RandomSource): { board: Board; position: Position | null } {
  const positions = emptyPositions(board);
  if (positions.length === 0) {
    return { board, position: null };
  }

  const position = positions[randomIndex(positions.length, random)];
  const value = random() < 0.9 ? 2 : 4;
  if (!position) {
    return { board, position: null };
  }

  const next = cloneBoard(board);
  const row = next[position.row];
  if (row) {
    row[position.col] = value;
  }
  return { board: next, position };
}

export function canMove(board: Board): boolean {
  const size = board.length;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const tile = board[row]?.[col] ?? 0;
      if (tile === 0) {
        return true;
      }
      if (col + 1 < size && tile === board[row]?.[col + 1]) {
        return true;
      }
      if (row + 1 < size && tile === board[row + 1]?.[col]) {
        return true;
      }
    }
  }
  return false;
}

export function hasWinningTile(board: Board): boolean {
  return board.some((row) => row.some((tile) => tile >= WINNING_TILE));
}

export function highestTile(board: Board): number {
  return Math.max(0, ...board.flatMap((row) => [...row]));
}

export function snapshotOf(state: GameState): GameSnapshot {
  return {
    board: state.board,
    score: state.score,
    moveCount: state.moveCount,
    hasWon: state.hasWon,
    winPresented: state.winPresented,
    status: state.status,
    mode: state.mode,
  };
}

export function createGame(
  random: RandomSource = Math.random,
  size: number = BOARD_SIZE,
  mode: GameMode = 'classic',
): GameState {
  const board: Tile[][] = Array.from({ length: size }, () =>
    Array<Tile>(size).fill(0),
  );

  for (let count = 0; count < 2; count += 1) {
    const spawned = spawnTile(board, random);
    for (let row = 0; row < size; row += 1) {
      board[row] = [...(spawned.board[row] ?? [])];
    }
  }

  return {
    board,
    score: 0,
    moveCount: 0,
    hasWon: false,
    winPresented: false,
    status: 'playing',
    mode,
    history: [],
  };
}

export function move(state: GameState, direction: Direction, random: RandomSource = Math.random): MoveResult {
  if (state.status !== 'playing') {
    return {
      state,
      changed: false,
      scoreGained: 0,
      merged: [],
      spawned: null,
      wonNow: false,
    };
  }

  const next = cloneBoard(state.board);
  const size = state.board.length;
  const merged: Position[] = [];
  let scoreGained = 0;

  for (let line = 0; line < size; line += 1) {
    const result = slideLine(lineFor(state.board, direction, line), size);
    scoreGained += result.gained;
    merged.push(
      ...result.mergedIndices.map((index) => positionFor(direction, line, index, size)),
    );
    writeLine(next, direction, line, result.tiles);
  }

  if (boardsEqual(state.board, next)) {
    return {
      state,
      changed: false,
      scoreGained: 0,
      merged: [],
      spawned: null,
      wonNow: false,
    };
  }

  const spawned = spawnTile(next, random);
  const wonNow = !state.hasWon && hasWinningTile(spawned.board);
  const status = wonNow ? 'won' : canMove(spawned.board) ? 'playing' : 'over';

  return {
    changed: true,
    scoreGained,
    merged,
    spawned: spawned.position,
    wonNow,
    state: {
      board: spawned.board,
      score: state.score + scoreGained,
      moveCount: state.moveCount + 1,
      hasWon: state.hasWon || wonNow,
      winPresented: state.winPresented || wonNow,
      status,
      mode: state.mode,
      history: [...state.history, snapshotOf(state)],
    },
  };
}

export function continueAfterWin(state: GameState): GameState {
  if (state.status !== 'won') {
    return state;
  }

  return {
    ...state,
    status: canMove(state.board) ? 'playing' : 'over',
    winPresented: true,
  };
}

export function undo(state: GameState): GameState {
  const previous = state.history.at(-1);
  if (!previous) {
    return state;
  }

  return {
    ...previous,
    hasWon: state.hasWon || previous.hasWon,
    winPresented: state.winPresented || previous.winPresented,
    history: state.history.slice(0, -1),
  };
}
