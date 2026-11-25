import type { PlayerStatistics } from '@neonfusion/storage';
import { ChartIcon, DatabaseIcon, SparkIcon } from '../components/Icons';
import { formatNumber, translate, type Language, type MessageKey } from '../i18n/messages';

interface StatisticsViewProps {
  statistics: PlayerStatistics;
  language: Language;
}

export function StatisticsView({ statistics, language }: StatisticsViewProps): React.JSX.Element {
  const t = (key: MessageKey): string => translate(language, key);
  const cards: { key: MessageKey; value: number; accent: string; decimals?: boolean }[] = [
    { key: 'totalGamesPlayed', value: statistics.totalGamesPlayed, accent: 'cyan' },
    { key: 'totalGamesWon', value: statistics.totalGamesWon, accent: 'violet' },
    { key: 'totalGamesLost', value: statistics.totalGamesLost, accent: 'rose' },
    { key: 'bestScore', value: statistics.bestScore, accent: 'amber' },
    { key: 'highestTile', value: statistics.highestTile, accent: 'mint' },
    { key: 'averageScore', value: statistics.averageScore, accent: 'blue', decimals: true },
  ];

  return (
    <section className="page-view statistics-view" aria-labelledby="statistics-title">
      <header className="page-heading">
        <div className="page-heading__icon">
          <ChartIcon />
        </div>
        <div>
          <p className="eyebrow">NEON FUSION / 2048</p>
          <h1 id="statistics-title">{t('statisticsTitle')}</h1>
          <p>{t('statisticsSubtitle')}</p>
        </div>
      </header>

      {statistics.totalGamesPlayed === 0 ? (
        <div className="empty-state">
          <SparkIcon />
          <p>{t('noGames')}</p>
        </div>
      ) : null}

      <div className="statistics-grid">
        {cards.map((card) => (
          <article key={card.key} className={`stat-card stat-card--${card.accent}`}>
            <span>{t(card.key)}</span>
            <strong>
              {formatNumber(card.decimals ? Math.round(card.value * 10) / 10 : card.value, language)}
            </strong>
            <div className="stat-card__line" aria-hidden="true" />
          </article>
        ))}
      </div>

      <div className="panel storage-explainer">
        <DatabaseIcon />
        <div>
          <h2>{t('storage')}</h2>
          <p>{t('privacyText')}</p>
        </div>
      </div>
    </section>
  );
}
