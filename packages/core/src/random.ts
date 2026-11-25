import type { RandomSource } from './types';

export function createSeededRandom(seed: number): RandomSource {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomIndex(length: number, random: RandomSource): number {
  if (length <= 0) {
    throw new RangeError('Cannot select an index from an empty collection.');
  }

  return Math.min(length - 1, Math.floor(random() * length));
}
