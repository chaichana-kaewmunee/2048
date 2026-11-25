import { useState } from 'react';
import {
  highestTile,
  WINNING_TILE,
  type Direction,
  type GameMode,
  type GameState,
  type MoveResult,
} from '@neonfusion/core';
import type { PlayerStatistics } from '@neonfusion/storage';
import { Dialog } from '../components/Dialog';
import { GameBoard } from '../components/GameBoard';
import { GameIcon, KeyboardIcon, PlusIcon, ShieldIcon, SparkIcon, TrophyIcon, UndoIcon } from '../components/Icons';
import { formatNumber, translate, type Language, type MessageKey } from '../i18n/messages';
import { submitLeaderboardScore } from '../lib/api';

interface GameViewProps {
  game: GameState;
  lastMove: MoveResult | null;
  statistics: PlayerStatistics;
  language: Language;
  mode: GameMode;
  timeLeft: number | null;
  onMove: (direction: Direction) => void;
  onUndo: () => void;
  onNewGame: () => void;
  onKeepPlaying: () => void;
  onFinishGame: () => void;
  onModeChange: (mode: GameMode) => void;
}

export function GameView({
  game,
  lastMove,
  statistics,
  language,
  mode,
  timeLeft,
  onMove,
  onUndo,
  onNewGame,
  onKeepPlaying,
  onFinishGame,
  onModeChange,
}: GameViewProps): React.JSX.Element {
  const t = (key: MessageKey): string => translate(language, key);
  const highest = highestTile(game.board);
  const progress = Math.min(100, (highest / WINNING_TILE) * 100);
  const statusKey = game.status === 'won' ? 'won' : game.status === 'over' ? 'over' : 'playing';

  const [submitting, setSubmitting] = useState(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('neon-fusion-player-name') ?? '';
    }
    return '';
  });

  const handleStartNewGame = () => {
    setSubmittedRank(null);
    onNewGame();
  };

  const handleSubmitScore = async () => {
    const name = playerName.trim() || (language === 'en' ? 'Player' : 'ผู้เล่น');
    try {
      localStorage.setItem('neon-fusion-player-name', name);
    } catch {}
    setSubmitting(true);
    try {
      const res = await submitLeaderboardScore({
        playerName: name,
        score: game.score,
        highestTile: highest,
        mode,
      });
      if (res.rank) {
        setSubmittedRank(res.rank);
      }
    } catch {
      // API offline
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="game-view" aria-label={t('game')}>
      <div className="game-mode-bar">
        <div className="mode-selector" role="group" aria-label={t('gameMode')}>
          {(['classic', '5x5', 'time-attack', 'practice'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`mode-btn ${mode === m ? 'is-active' : ''}`}
              onClick={() => onModeChange(m)}
            >
              {m === 'classic' && t('modeClassic')}
              {m === '5x5' && t('mode5x5')}
              {m === 'time-attack' && t('modeTimeAttack')}
              {m === 'practice' && t('modePractice')}
            </button>
          ))}
        </div>
      </div>

      <div className="game-layout">
        <div className="board-column">
          <div className="board-topline">
            <div className={`status-chip status-chip--${game.status}`}>
              <span className="status-chip__dot" aria-hidden="true" />
              {t(statusKey)}
            </div>
            {mode === 'time-attack' && timeLeft !== null ? (
              <div className={`status-chip timer-chip ${timeLeft <= 10 ? 'timer-chip--urgent' : ''}`}>
                <span>⏱ {timeLeft} {t('seconds')}</span>
              </div>
            ) : null}
            <span className="move-count">
              {t('moves')} <strong>{formatNumber(game.moveCount, language)}</strong>
            </span>
          </div>

          <GameBoard
            board={game.board}
            lastMove={lastMove}
            language={language}
            disabled={game.status !== 'playing'}
            onMove={onMove}
          />

          <div className="mobile-controls">
            <button className="button button--secondary" type="button" onClick={onUndo} disabled={game.history.length === 0}>
              <UndoIcon />
              {t('undo')}
            </button>
            <button className="button button--primary" type="button" onClick={onNewGame}>
              <PlusIcon />
              {t('newGame')}
            </button>
          </div>
        </div>

        <aside className="game-sidebar">
          <div className="score-grid">
            <div className="score-card score-card--score">
              <span className="score-card__label">{t('score')}</span>
              <strong data-testid="score">{formatNumber(game.score, language)}</strong>
              {lastMove && lastMove.scoreGained > 0 ? (
                <span key={game.moveCount} className="score-card__gain">
                  +{formatNumber(lastMove.scoreGained, language)}
                </span>
              ) : null}
            </div>
            <div className="score-card">
              <span className="score-card__label">{t('best')}</span>
              <strong data-testid="best-score">{formatNumber(statistics.bestScore, language)}</strong>
            </div>
          </div>

          <div className="panel progress-panel">
            <div className="panel__heading">
              <span>{t('highest')}</span>
              <strong>{formatNumber(highest, language)}</strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={t('highest')}
              aria-valuemin={0}
              aria-valuemax={WINNING_TILE}
              aria-valuenow={Math.min(highest, WINNING_TILE)}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-panel__target">
              <SparkIcon />
              <span>2048</span>
            </div>
          </div>

          <div className="panel controls-panel">
            <div className="panel__title">
              <GameIcon />
              <h2>{t('gameControls')}</h2>
            </div>
            <div className="desktop-controls">
              <button className="button button--secondary" type="button" onClick={onUndo} disabled={game.history.length === 0}>
                <UndoIcon />
                {t('undo')}
              </button>
              <button className="button button--primary" type="button" onClick={onNewGame}>
                <PlusIcon />
                {t('newGame')}
              </button>
            </div>
            <div className="input-hints">
              <span>
                <KeyboardIcon />
                {t('keyboardHint')}
              </span>
              <span>
                <span className="swipe-symbol" aria-hidden="true">↔</span>
                {t('swipeHint')}
              </span>
            </div>
          </div>

          <div className="panel info-panel">
            <div className="panel__title">
              <SparkIcon />
              <h2>{t('howToPlay')}</h2>
            </div>
            <p>{t('instruction')}</p>
          </div>

          <div className="local-note">
            <ShieldIcon />
            <div>
              <strong>{t('localFirst')}</strong>
              <p>{t('localFirstText')}</p>
            </div>
          </div>
        </aside>
      </div>

      {game.status === 'won' && game.winPresented ? (
        <Dialog title={t('winTitle')} description={t('winText')}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="button button--primary" type="button" onClick={onKeepPlaying}>
              {t('keepPlaying')}
            </button>
            <button className="button button--secondary" type="button" onClick={onFinishGame}>
              {t('finishGame')}
            </button>
          </div>
          {submittedRank !== null ? (
            <p style={{ color: '#62e987', marginTop: '12px', fontWeight: 700 }}>
              {t('scoreSubmitted')}{submittedRank}
            </p>
          ) : (
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                maxLength={20}
                placeholder={language === 'en' ? 'Your name' : 'ชื่อของคุณ'}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'rgba(8, 13, 28, 0.8)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
              <button
                className="button button--secondary"
                type="button"
                onClick={handleSubmitScore}
                disabled={submitting}
              >
                <TrophyIcon />
                {submitting ? t('submitting') : t('submitScore')}
              </button>
            </div>
          )}
        </Dialog>
      ) : null}

      {game.status === 'over' ? (
        <Dialog title={t('gameOverTitle')} description={t('gameOverText')} tone="loss">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="button button--primary" type="button" onClick={handleStartNewGame}>
              <PlusIcon />
              {t('tryAgain')}
            </button>
            {game.history.length > 0 ? (
              <button className="button button--secondary" type="button" onClick={onUndo}>
                <UndoIcon />
                {t('undo')}
              </button>
            ) : null}
          </div>
          {submittedRank !== null ? (
            <p style={{ color: '#62e987', marginTop: '12px', fontWeight: 700 }}>
              {t('scoreSubmitted')}{submittedRank}
            </p>
          ) : game.score > 0 ? (
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                maxLength={20}
                placeholder={language === 'en' ? 'Your name' : 'ชื่อของคุณ'}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'rgba(8, 13, 28, 0.8)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
              <button
                className="button button--secondary"
                type="button"
                onClick={handleSubmitScore}
                disabled={submitting}
              >
                <TrophyIcon />
                {submitting ? t('submitting') : t('submitScore')}
              </button>
            </div>
          ) : null}
        </Dialog>
      ) : null}
    </section>
  );
}
