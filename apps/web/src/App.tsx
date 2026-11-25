import { useCallback, useEffect, useRef, useState } from 'react';
import { highestTile } from '@neonfusion/core';
import type { GameResult } from '@neonfusion/storage';
import {
  ChartIcon,
  DatabaseIcon,
  GameIcon,
  SettingsIcon,
  SoundOffIcon,
  SoundOnIcon,
  SparkIcon,
  TrophyIcon,
} from './components/Icons';
import { useApiHealth } from './hooks/useApiHealth';
import { useGame } from './hooks/useGame';
import { useLanguage } from './hooks/useLanguage';
import { useSound } from './hooks/useSound';
import { useStatistics } from './hooks/useStatistics';
import { translate, type MessageKey } from './i18n/messages';
import { GameView } from './views/GameView';
import { LeaderboardView } from './views/LeaderboardView';
import { SettingsView } from './views/SettingsView';
import { StatisticsView } from './views/StatisticsView';

type View = 'game' | 'leaderboard' | 'statistics' | 'settings';

export default function App(): React.JSX.Element {
  const [view, setView] = useState<View>('game');
  const { language, setLanguage } = useLanguage();
  const sound = useSound();
  const { game, gameId, lastMove, mode, timeLeft, move, undo, newGame, keepPlaying, changeMode } = useGame({
    onMove: sound.playMove,
    onMerge: sound.playMerge,
    onWin: sound.playWin,
    onGameOver: sound.playGameOver,
    onUndo: sound.playUndo,
  });
  const { statistics, status, loading, recordGame } = useStatistics();
  const apiHealth = useApiHealth();
  const finalizedGames = useRef(new Set<number>());
  const t = (key: MessageKey): string => translate(language, key);

  useEffect(() => {
    document.title = `${t('appName')} — 2048`;
  }, [language]);

  const finalizeGame = useCallback(
    async (result: GameResult): Promise<void> => {
      if (finalizedGames.current.has(gameId)) {
        return;
      }
      finalizedGames.current.add(gameId);
      await recordGame(result);
    },
    [gameId, recordGame],
  );

  useEffect(() => {
    if (game.status !== 'over') {
      return;
    }
    void finalizeGame({
      score: game.score,
      highestTile: highestTile(game.board),
      won: game.hasWon,
      lost: true,
    });
  }, [finalizeGame, game.board, game.hasWon, game.score, game.status]);

  const finishGame = useCallback(async (): Promise<void> => {
    await finalizeGame({
      score: game.score,
      highestTile: highestTile(game.board),
      won: true,
      lost: false,
    });
    newGame();
  }, [finalizeGame, game.board, game.score, newGame]);

  const navigation: { id: View; label: MessageKey; icon: React.ReactNode }[] = [
    { id: 'game', label: 'game', icon: <GameIcon /> },
    { id: 'leaderboard', label: 'leaderboard', icon: <TrophyIcon /> },
    { id: 'statistics', label: 'statistics', icon: <ChartIcon /> },
    { id: 'settings', label: 'settings', icon: <SettingsIcon /> },
  ];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {language === 'en' ? 'Skip to content' : 'ข้ามไปยังเนื้อหา'}
      </a>
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />

      <header className="app-header">
        <button className="brand" type="button" onClick={() => setView('game')} aria-label={t('appName')}>
          <span className="brand__mark" aria-hidden="true">
            <SparkIcon />
          </span>
          <span className="brand__copy">
            <strong>{t('appName')}</strong>
            <span>{t('tagline')}</span>
          </span>
          <span className="brand__edition">2048</span>
        </button>

        <nav className="main-nav" aria-label={language === 'en' ? 'Main navigation' : 'เมนูหลัก'}>
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? 'is-active' : ''}
              aria-current={view === item.id ? 'page' : undefined}
              onClick={() => setView(item.id)}
            >
              {item.icon}
              <span>{t(item.label)}</span>
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="language-toggle"
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
            aria-label={language === 'en' ? 'Switch to Thai' : 'Switch to English'}
          >
            <span className={language === 'en' ? 'is-active' : ''}>EN</span>
            <span aria-hidden="true">/</span>
            <span className={language === 'th' ? 'is-active' : ''}>TH</span>
          </button>

          <button
            className="icon-button sound-toggle"
            type="button"
            onClick={sound.toggleSound}
            aria-label={t('toggleSound')}
            title={sound.config.enabled ? t('soundEnabled') : t('soundDisabled')}
          >
            {sound.config.enabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
        </div>
      </header>

      {!loading && !status.available ? (
        <div className="storage-banner" role="status">
          <DatabaseIcon />
          <p>{t('storageUnavailable')}</p>
          <button type="button" onClick={() => setView('settings')}>
            {t('settings')}
          </button>
        </div>
      ) : null}

      <main id="main-content" className="app-main">
        {view === 'game' ? (
          <GameView
            game={game}
            lastMove={lastMove}
            statistics={statistics}
            language={language}
            mode={mode}
            timeLeft={timeLeft}
            onMove={move}
            onUndo={undo}
            onNewGame={newGame}
            onKeepPlaying={keepPlaying}
            onFinishGame={() => void finishGame()}
            onModeChange={changeMode}
          />
        ) : null}
        {view === 'leaderboard' ? <LeaderboardView language={language} /> : null}
        {view === 'statistics' ? <StatisticsView statistics={statistics} language={language} /> : null}
        {view === 'settings' ? (
          <SettingsView
            language={language}
            status={status}
            loading={loading}
            apiHealth={apiHealth}
            soundConfig={sound.config}
            onLanguageChange={setLanguage}
            onToggleSound={sound.toggleSound}
            onVolumeChange={sound.setVolume}
          />
        ) : null}
      </main>

      <footer className="app-footer">
        <span>NEON FUSION · 2048</span>
        <span>{t('localFirst')} · SQLite WASM</span>
      </footer>
    </div>
  );
}
