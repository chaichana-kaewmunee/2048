import { describe, expect, it } from 'vitest';
import { soundManager } from '../src/lib/audio';

describe('SoundManager', () => {
  it('manages sound enabled and volume state', () => {
    soundManager.setEnabled(true);
    expect(soundManager.getConfig().enabled).toBe(true);

    soundManager.setEnabled(false);
    expect(soundManager.getConfig().enabled).toBe(false);

    soundManager.setVolume(0.8);
    expect(soundManager.getConfig().volume).toBe(0.8);

    soundManager.setVolume(1.5); // clamps to 1
    expect(soundManager.getConfig().volume).toBe(1.0);

    soundManager.setVolume(-0.2); // clamps to 0
    expect(soundManager.getConfig().volume).toBe(0.0);
  });

  it('can call sound effect methods safely without error', () => {
    soundManager.setEnabled(true);
    soundManager.setVolume(0.5);
    expect(() => soundManager.playMove()).not.toThrow();
    expect(() => soundManager.playMerge(4)).not.toThrow();
    expect(() => soundManager.playWin()).not.toThrow();
    expect(() => soundManager.playGameOver()).not.toThrow();
    expect(() => soundManager.playUndo()).not.toThrow();
  });
});
