import { useCallback, useEffect, useRef, useState } from 'react';
import {
  continueAfterWin,
  createGame,
  move as moveGame,
  undo as undoGame,
  type Direction,
  type GameMode,
  type GameState,
  type MoveResult,
} from '@neonfusion/core';

export interface GameEvents {
  onMove?: () => void;
  onMerge?: (scoreGained?: number) => void;
  onWin?: () => void;
  onGameOver?: () => void;
  onUndo?: () => void;
}

export function useGame(events?: GameEvents): {
  game: GameState;
  gameId: number;
  lastMove: MoveResult | null;
  mode: GameMode;
  timeLeft: number | null;
  move: (direction: Direction) => void;
  undo: () => void;
  newGame: (newMode?: GameMode) => void;
  keepPlaying: () => void;
  changeMode: (newMode: GameMode) => void;
} {
  const [mode, setMode] = useState<GameMode>('classic');
  const [game, setGame] = useState<GameState>(() => createGame(Math.random, 4, 'classic'));
  const [gameId, setGameId] = useState(1);
  const [lastMove, setLastMove] = useState<MoveResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const gameRef = useRef(game);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  const commit = useCallback((next: GameState) => {
    gameRef.current = next;
    setGame(next);
  }, []);

  const startNewGame = useCallback(
    (targetMode: GameMode = mode) => {
      const size = targetMode === '5x5' ? 5 : 4;
      setMode(targetMode);
      setLastMove(null);
      if (targetMode === 'time-attack') {
        setTimeLeft(60);
      } else {
        setTimeLeft(null);
      }
      commit(createGame(Math.random, size, targetMode));
      setGameId((current) => current + 1);
    },
    [commit, mode],
  );

  const move = useCallback(
    (direction: Direction) => {
      const result = moveGame(gameRef.current, direction);
      if (result.changed) {
        setLastMove(result);
        commit(result.state);
        if (mode === 'time-attack' && result.scoreGained > 0) {
          setTimeLeft((current) => (current !== null ? Math.min(90, current + 2) : 60));
        }
        if (result.wonNow) {
          eventsRef.current?.onWin?.();
        } else if (result.scoreGained > 0) {
          eventsRef.current?.onMerge?.(result.scoreGained);
        } else {
          eventsRef.current?.onMove?.();
        }
        if (result.state.status === 'over') {
          eventsRef.current?.onGameOver?.();
        }
      }
    },
    [commit, mode],
  );

  const undo = useCallback(() => {
    const next = undoGame(gameRef.current);
    if (next !== gameRef.current) {
      setLastMove(null);
      commit(next);
      eventsRef.current?.onUndo?.();
    }
  }, [commit]);

  const keepPlaying = useCallback(() => {
    setLastMove(null);
    commit(continueAfterWin(gameRef.current));
  }, [commit]);

  // Timer countdown for Time Attack mode
  useEffect(() => {
    if (mode !== 'time-attack' || game.status !== 'playing' || timeLeft === null) {
      return;
    }

    if (timeLeft <= 0) {
      commit({ ...gameRef.current, status: 'over' });
      eventsRef.current?.onGameOver?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          commit({ ...gameRef.current, status: 'over' });
          eventsRef.current?.onGameOver?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [commit, game.status, mode, timeLeft]);

  return {
    game,
    gameId,
    lastMove,
    mode,
    timeLeft,
    move,
    undo,
    newGame: startNewGame,
    keepPlaying,
    changeMode: startNewGame,
  };
}
