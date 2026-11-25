import { useEffect, useState } from 'react';
import type { GameMode } from '@neonfusion/core';
import { TrophyIcon, SparkIcon } from '../components/Icons';
import { formatNumber, translate, type Language, type MessageKey } from '../i18n/messages';
import { getLeaderboard, type LeaderboardEntry } from '../lib/api';

interface LeaderboardViewProps {
  language: Language;
}

export function LeaderboardView({ language }: LeaderboardViewProps): React.JSX.Element {
  const [mode, setMode] = useState<GameMode>('classic');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = (key: MessageKey): string => translate(language, key);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getLeaderboard(mode)
      .then((data) => {
        if (active) {
          setEntries(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [mode]);

  return (
    <section className="page-view leaderboard-view" aria-labelledby="leaderboard-title">
      <header className="page-heading">
        <div className="page-heading__icon">
          <TrophyIcon />
        </div>
        <div>
          <p className="eyebrow">NEON FUSION / 2048</p>
          <h1 id="leaderboard-title">{t('leaderboardTitle')}</h1>
          <p>{t('leaderboardSubtitle')}</p>
        </div>
      </header>

      <div className="game-mode-bar" style={{ justifyContent: 'flex-start', margin: '20px 0' }}>
        <div className="mode-selector" role="group" aria-label={t('gameMode')}>
          {(['classic', '5x5', 'time-attack'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`mode-btn ${mode === m ? 'is-active' : ''}`}
              onClick={() => setMode(m)}
            >
              {m === 'classic' && t('modeClassic')}
              {m === '5x5' && t('mode5x5')}
              {m === 'time-attack' && t('modeTimeAttack')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p>{t('stateChecking')}…</p>
        </div>
      ) : error ? (
        <div className="panel" style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
          <p>{t('apiOffline')}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <SparkIcon />
          <p style={{ marginTop: '10px' }}>{t('leaderboardEmpty')}</p>
        </div>
      ) : (
        <div className="leaderboard-table-wrapper panel">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>{t('rank')}</th>
                <th>{t('player')}</th>
                <th style={{ textAlign: 'right' }}>{t('score')}</th>
                <th style={{ textAlign: 'center' }}>{t('highest')}</th>
                <th style={{ textAlign: 'right' }}>{t('date')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const rank = index + 1;
                const rankBadgeClass =
                  rank === 1
                    ? 'rank-badge rank-badge--gold'
                    : rank === 2
                      ? 'rank-badge rank-badge--silver'
                      : rank === 3
                        ? 'rank-badge rank-badge--bronze'
                        : 'rank-badge';

                return (
                  <tr key={entry.id || index}>
                    <td>
                      <span className={rankBadgeClass}>#{rank}</span>
                    </td>
                    <td>
                      <strong className="player-name">{entry.playerName}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="score-value">{formatNumber(entry.score, language)}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="tile-chip">{formatNumber(entry.highestTile, language)}</span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--muted)', fontSize: '0.85rem' }}>
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
