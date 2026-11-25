// Unit test for deterministic game creation with seeded random
import { expect, test } from 'vitest';
import { createGame, createSeededRandom } from '../src';

/**
 * The seeded random should produce a deterministic initial board with exactly two tiles.
 * This test ensures that using the same seed results in the same board layout.
 */
test('createGame deterministic with seeded random', () => {
  const seed = 12345;
  const random = createSeededRandom(seed);
  const state = createGame(random);

  // Board must have exactly two non-zero tiles
  const tiles = state.board.flat().filter((t) => t !== 0);
  expect(tiles).toHaveLength(2);
  // Each tile must be 2 or 4
  expect(tiles.every((t) => t === 2 || t === 4)).toBe(true);

  // Running again with the same seed should give the same board configuration
  const repeatState = createGame(createSeededRandom(seed));
  expect(repeatState.board).toEqual(state.board);
});
