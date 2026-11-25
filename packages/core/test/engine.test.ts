import { describe, expect, it, vi } from 'vitest';
import {
  BOARD_SIZE,
  canMove,
  continueAfterWin,
  createGame,
  createSeededRandom,
  highestTile,
  move,
  undo,
  type Board,
  type GameState,
  type RandomSource,
} from '../src';

function stateWith(board: Board, overrides: Partial<GameState> = {}): GameState {
  return {
    board,
    score: 0,
    moveCount: 0,
    hasWon: false,
    winPresented: false,
    status: 'playing',
    history: [],
    ...overrides,
  };
}

function scriptedRandom(...values: number[]): RandomSource {
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
}

const emptyRows = (): number[][] =>
  Array.from({ length: BOARD_SIZE }, () => Array<number>(BOARD_SIZE).fill(0));

describe('game creation', () => {
  it('starts with exactly two tiles on a 4x4 board', () => {
    const state = createGame(createSeededRandom(42));
    const tiles = state.board.flat().filter((tile) => tile !== 0);

    expect(state.board).toHaveLength(4);
    expect(state.board.every((row) => row.length === 4)).toBe(true);
    expect(tiles).toHaveLength(2);
    expect(tiles.every((tile) => tile === 2 || tile === 4)).toBe(true);
    expect(state.score).toBe(0);
    expect(state.history).toHaveLength(0);
  });
});

describe('movement and merging', () => {
  it('slides and merges equal tiles to the left', () => {
    const board = emptyRows();
    board[0] = [2, 2, 2, 2];
    const result = move(stateWith(board), 'left', scriptedRandom(0, 0));

    expect(result.changed).toBe(true);
    expect(result.scoreGained).toBe(8);
    expect(result.state.board[0]).toEqual([4, 4, 2, 0]);
    expect(result.merged).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
    ]);
    expect(result.state.score).toBe(8);
  });

  it('does not merge the same tile twice in one move', () => {
    const board = emptyRows();
    board[0] = [2, 2, 4, 0];
    const result = move(stateWith(board), 'left', scriptedRandom(0.99, 0));

    expect(result.scoreGained).toBe(4);
    expect(result.state.board[0]?.[0]).toBe(4);
    expect(result.state.board[0]?.[1]).toBe(4);
  });

  it('merges toward the right', () => {
    const board = emptyRows();
    board[1] = [2, 2, 2, 0];
    const result = move(stateWith(board), 'right', scriptedRandom(0.99, 0));

    expect(result.scoreGained).toBe(4);
    expect(result.state.board[1]).toEqual([0, 0, 2, 4]);
  });

  it('merges columns upward', () => {
    const board = emptyRows();
    board[0]![2] = 2;
    board[1]![2] = 2;
    board[2]![2] = 2;
    const result = move(stateWith(board), 'up', scriptedRandom(0.99, 0));

    expect(result.scoreGained).toBe(4);
    expect(result.state.board.map((row) => row[2])).toEqual([4, 2, 0, 0]);
  });

  it('merges columns downward', () => {
    const board = emptyRows();
    board[0]![1] = 2;
    board[1]![1] = 2;
    board[2]![1] = 2;
    const result = move(stateWith(board), 'down', scriptedRandom(0.99, 0));

    expect(result.scoreGained).toBe(4);
    expect(result.state.board.map((row) => row[1])).toEqual([0, 0, 2, 4]);
  });

  it('does not spawn, score, or record history for an invalid move', () => {
    const board = emptyRows();
    board[0] = [2, 4, 8, 16];
    const random = vi.fn(scriptedRandom(0, 0));
    const state = stateWith(board, { score: 12, moveCount: 3 });
    const result = move(state, 'left', random);

    expect(result.changed).toBe(false);
    expect(result.state).toBe(state);
    expect(result.scoreGained).toBe(0);
    expect(result.spawned).toBeNull();
    expect(random).not.toHaveBeenCalled();
    expect(state.history).toHaveLength(0);
  });

  it('spawns a 2 for 90% of random values and a 4 for the remaining 10%', () => {
    const board = emptyRows();
    board[0] = [2, 2, 0, 0];

    const two = move(stateWith(board), 'left', scriptedRandom(0, 0.899));
    const four = move(stateWith(board), 'left', scriptedRandom(0, 0.9));

    expect(two.spawned).toEqual({ row: 0, col: 1 });
    expect(two.state.board[0]?.[1]).toBe(2);
    expect(four.spawned).toEqual({ row: 0, col: 1 });
    expect(four.state.board[0]?.[1]).toBe(4);
  });
});

describe('win and loss', () => {
  it('enters the won state once when a 2048 tile is created', () => {
    const board = emptyRows();
    board[0] = [1024, 1024, 0, 0];
    const result = move(stateWith(board), 'left', scriptedRandom(0.99, 0));

    expect(result.wonNow).toBe(true);
    expect(result.state.status).toBe('won');
    expect(result.state.hasWon).toBe(true);
    expect(result.state.winPresented).toBe(true);
    expect(highestTile(result.state.board)).toBe(2048);
  });

  it('allows play to continue after winning', () => {
    const won = stateWith(
      [
        [2048, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      { status: 'won', hasWon: true, winPresented: true },
    );

    const continued = continueAfterWin(won);
    const result = move(continued, 'down', scriptedRandom(0.99, 0));

    expect(continued.status).toBe('playing');
    expect(result.changed).toBe(true);
    expect(result.wonNow).toBe(false);
  });

  it('detects a full board with no possible merges', () => {
    const board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];

    expect(canMove(board)).toBe(false);
    expect(canMove([...board.slice(0, 3), [4, 2, 4, 4]])).toBe(true);
  });
});

describe('undo', () => {
  it('restores board, score, status, and move count', () => {
    const board = emptyRows();
    board[0] = [2, 2, 0, 0];
    const moved = move(stateWith(board), 'left', scriptedRandom(0.99, 0)).state;
    const restored = undo(moved);

    expect(restored.board).toEqual(board);
    expect(restored.score).toBe(0);
    expect(restored.moveCount).toBe(0);
    expect(restored.history).toHaveLength(0);
    expect(moved.history).toHaveLength(1);
  });

  it('supports unlimited undo within the current game', () => {
    const random = createSeededRandom(7);
    let state = createGame(random);
    for (let index = 0; index < 20; index += 1) {
      const directions = ['left', 'up', 'right', 'down'] as const;
      state = move(state, directions[index % directions.length]!, random).state;
    }

    for (let index = 0; index < 20; index += 1) {
      state = undo(state);
    }

    expect(state.moveCount).toBe(0);
    expect(state.score).toBe(0);
    expect(state.history).toHaveLength(0);
  });

  it('can undo after game over without mutating the previous state', () => {
    const board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    const over = stateWith(board, {
      status: 'over',
      score: 100,
      history: [stateWith(emptyRows(), { score: 80 })],
    });

    expect(undo(over).status).toBe('playing');
    expect(undo(over).score).toBe(80);
    expect(over.status).toBe('over');
  });

  it('never shows the victory dialog twice for the same game', () => {
    const board = emptyRows();
    board[0] = [1024, 1024, 0, 0];
    const won = move(stateWith(board), 'left', scriptedRandom(0.99, 0)).state;
    const restored = undo(won);
    const wonAgain = move(restored, 'left', scriptedRandom(0.99, 0));

    expect(wonAgain.wonNow).toBe(false);
    expect(wonAgain.state.hasWon).toBe(true);
    expect(wonAgain.state.winPresented).toBe(true);
    expect(wonAgain.state.status).toBe('playing');
  });

  it('is a no-op when history is empty', () => {
    const state = createGame(createSeededRandom(1));
    expect(undo(state)).toBe(state);
  });
});

describe('determinism and immutability', () => {
  it('replays the same game with the same seed', () => {
    const play = (): GameState => {
      const random = createSeededRandom(1234);
      let state = createGame(random);
      const directions = ['left', 'up', 'right', 'down'] as const;
      for (let index = 0; index < 30; index += 1) {
        state = move(state, directions[index % 4]!, random).state;
      }
      return state;
    };

    expect(play()).toEqual(play());
  });

  it('does not mutate the input board or history', () => {
    const board = emptyRows();
    board[0] = [2, 2, 0, 0];
    const original = board.map((row) => [...row]);
    const state = stateWith(board);

    move(state, 'left', scriptedRandom(0, 0));

    expect(board).toEqual(original);
    expect(state.history).toHaveLength(0);
  });

  it('supports 5x5 board mode with correct sliding and dimensions', () => {
    const state = createGame(createSeededRandom(99), 5, '5x5');
    expect(state.board).toHaveLength(5);
    expect(state.board.every((row) => row.length === 5)).toBe(true);
    expect(state.mode).toBe('5x5');

    const board5x5 = Array.from({ length: 5 }, () => Array<number>(5).fill(0));
    board5x5[0] = [2, 2, 4, 4, 8];
    const testState = stateWith(board5x5, { mode: '5x5' });
    const result = move(testState, 'left', scriptedRandom(0, 0));
    expect(result.changed).toBe(true);
    expect(result.scoreGained).toBe(4 + 8); // 2+2=4, 4+4=8
    expect(result.state.board[0]?.[0]).toBe(4);
    expect(result.state.board[0]?.[1]).toBe(8);
    expect(result.state.board[0]?.[2]).toBe(8);
  });
});
