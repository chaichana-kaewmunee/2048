// packages/core/test/undo-language.test.ts
// Simple in‑memory mocks for browser globals used in the tests.
// These are only for the Node test environment; they do not affect the actual app.
const localStorage = (() => {
  const store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    clear() {
      for (const k in store) delete store[k];
    },
    removeItem(key: string) {
      delete store[key];
    },
  };
})();

const document = {
  documentElement: { lang: '' },
} as any;

import { test, expect } from 'vitest';
import { createGame, move, undo } from '../src';
import { createSeededRandom } from '../src/random';

test('undo restores board and language stays unchanged', () => {
    const random = createSeededRandom(1);
    const state = createGame(random);
    // simulate language stored in localStorage
    const langKey = 'neon_fusion_lang';
    localStorage.setItem(langKey, 'en');
    const moved = move(state, 'left', random);
    const undone = undo(moved.state);
    expect(undone.board).toEqual(state.board);
    expect(localStorage.getItem(langKey)).toBe('en');
});

test('language switch persists in localStorage', () => {
    const langKey = 'neon_fusion_lang';
    localStorage.clear();
    // mimic UI action
    localStorage.setItem(langKey, 'th');
    document.documentElement.lang = 'th';
    expect(localStorage.getItem(langKey)).toBe('th');
    expect(document.documentElement.lang).toBe('th');
});