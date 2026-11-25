import type { StorageStatus } from '@neonfusion/storage';
import type { ApiHealthState } from '../hooks/useApiHealth';
import type { SoundConfig } from '../lib/audio';
import { DatabaseIcon, KeyboardIcon, SettingsIcon, ShieldIcon, SoundOffIcon, SoundOnIcon } from '../components/Icons';
import { translate, type Language, type MessageKey } from '../i18n/messages';

interface SettingsViewProps {
  language: Language;
  status: StorageStatus;
  loading: boolean;
  apiHealth: ApiHealthState;
  soundConfig: SoundConfig;
  onLanguageChange: (language: Language) => void;
  onToggleSound: () => void;
  onVolumeChange: (volume: number) => void;
}

export function SettingsView({
  language,
  status,
  loading,
  apiHealth,
  soundConfig,
  onLanguageChange,
  onToggleSound,
  onVolumeChange,
}: SettingsViewProps): React.JSX.Element {
  const t = (key: MessageKey): string => translate(language, key);

  return (
    <section className="page-view settings-view" aria-labelledby="settings-title">
      <header className="page-heading">
        <div className="page-heading__icon">
          <SettingsIcon />
        </div>
        <div>
          <p className="eyebrow">NEON FUSION / 2048</p>
          <h1 id="settings-title">{t('settingsTitle')}</h1>
          <p>{t('settingsSubtitle')}</p>
        </div>
      </header>

      <div className="settings-list">
        <article className="setting-row">
          <div className="setting-row__icon">
            <span className="language-glyph" aria-hidden="true">A</span>
          </div>
          <div className="setting-row__content">
            <h2>{t('language')}</h2>
            <p>{t('languageHelp')}</p>
            <div className="language-switch" role="group" aria-label={t('language')}>
              <button
                type="button"
                className={language === 'en' ? 'is-active' : ''}
                aria-pressed={language === 'en'}
                onClick={() => onLanguageChange('en')}
              >
                English
              </button>
              <button
                type="button"
                className={language === 'th' ? 'is-active' : ''}
                aria-pressed={language === 'th'}
                onClick={() => onLanguageChange('th')}
              >
                ไทย
              </button>
            </div>
          </div>
        </article>

        <article className="setting-row">
          <div className="setting-row__icon">
            {soundConfig.enabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </div>
          <div className="setting-row__content">
            <h2>{t('sound')}</h2>
            <p>{soundConfig.enabled ? t('soundEnabled') : t('soundDisabled')}</p>
            <div className="sound-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className={`button ${soundConfig.enabled ? 'button--secondary' : 'button--primary'}`}
                onClick={onToggleSound}
                aria-pressed={soundConfig.enabled}
              >
                {soundConfig.enabled ? <SoundOffIcon /> : <SoundOnIcon />}
                <span>{soundConfig.enabled ? t('soundDisabled') : t('soundEnabled')}</span>
              </button>
              {soundConfig.enabled ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span>{t('volume')}</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundConfig.volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    aria-label={t('volume')}
                  />
                </label>
              ) : null}
            </div>
          </div>
        </article>

        <article className="setting-row">
          <div className="setting-row__icon">
            <DatabaseIcon />
          </div>
          <div className="setting-row__content">
            <h2>{t('storage')}</h2>
            <p className={!loading && !status.available ? 'text-warning' : ''}>
              {loading ? t('storageChecking') : status.available ? t('storageReady') : t('storageUnavailable')}
            </p>
            <span className={`storage-badge ${status.available ? 'storage-badge--ready' : ''}`}>
              <span aria-hidden="true" />
              {status.available ? 'SQLite WASM · kvvfs' : t('sessionMemory')}
            </span>
          </div>
        </article>

        <article className="setting-row">
          <div className="setting-row__icon">
            {soundConfig.enabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </div>
          <div className="setting-row__content">
            <h2>{t('sound')}</h2>
            <p>{soundConfig.enabled ? t('soundEnabled') : t('soundDisabled')}</p>
            <div className="sound-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className={`button ${soundConfig.enabled ? 'button--secondary' : 'button--primary'}`}
                onClick={onToggleSound}
                aria-pressed={soundConfig.enabled}
              >
                {soundConfig.enabled ? <SoundOffIcon /> : <SoundOnIcon />}
                <span>{soundConfig.enabled ? t('soundDisabled') : t('soundEnabled')}</span>
              </button>
              {soundConfig.enabled ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span>{t('volume')}</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundConfig.volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    aria-label={t('volume')}
                  />
                </label>
              ) : null}
            </div>
          </div>
        </article>

        <article className="setting-row">
          <div className="setting-row__icon">
            <DatabaseIcon />
          </div>
          <div className="setting-row__content">
            <h2>{t('apiStatus')}</h2>
            <p>
              {apiHealth === 'checking'
                ? t('apiChecking')
                : apiHealth === 'online'
                  ? t('apiOnline')
                  : t('apiOffline')}
            </p>
            <span className={`storage-badge ${apiHealth === 'online' ? 'storage-badge--ready' : ''}`}>
              <span aria-hidden="true" />
              {apiHealth === 'checking'
                ? t('stateChecking')
                : apiHealth === 'online'
                  ? t('stateOnline')
                  : t('stateOffline')}
            </span>
          </div>
        </article>

        <article className="setting-row">
          <div className="setting-row__icon">
            <ShieldIcon />
          </div>
          <div className="setting-row__content">
            <h2>{t('privacy')}</h2>
            <p>{t('privacyText')}</p>
          </div>
        </article>

        <article className="setting-row">
          <div className="setting-row__icon">
            <KeyboardIcon />
          </div>
          <div className="setting-row__content">
            <h2>{t('accessibility')}</h2>
            <p>{t('accessibilityText')}</p>
          </div>
        </article>
      </div>
    </section>
  );
}
