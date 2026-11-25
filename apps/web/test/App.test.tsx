// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { EMPTY_STATISTICS } from '@neonfusion/storage';

vi.mock('../src/components/GameBoard', () => ({
  GameBoard: () => <div data-testid="mock-board" />,
}));

vi.mock('../src/hooks/useApiHealth', () => ({
  useApiHealth: () => 'online',
}));

vi.mock('../src/hooks/useStatistics', () => ({
  useStatistics: () => ({
    statistics: EMPTY_STATISTICS,
    status: { mode: 'sqlite', available: true },
    loading: false,
    recordGame: vi.fn(),
  }),
}));

describe('React application integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the game and navigates between views', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'How to play' })).toBeInTheDocument();
    expect(screen.getByTestId('mock-board')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Statistics' }));
    expect(screen.getByRole('heading', { name: 'Your statistics' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('switches the full interface to Thai and persists the choice', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Thai' }));

    expect(screen.getByRole('button', { name: 'เล่นเกม' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'วิธีเล่น' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('th');
    expect(localStorage.getItem('neon-fusion-language')).toBe('th');
  });
});
