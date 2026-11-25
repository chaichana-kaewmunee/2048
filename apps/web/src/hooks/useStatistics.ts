import { useCallback, useEffect, useState } from 'react';
import {
  EMPTY_STATISTICS,
  getStatisticsStore,
  type GameResult,
  type PlayerStatistics,
  type StorageStatus,
} from '@neonfusion/storage';

export function useStatistics(): {
  statistics: PlayerStatistics;
  status: StorageStatus;
  loading: boolean;
  recordGame: (result: GameResult) => Promise<void>;
} {
  const [statistics, setStatistics] = useState<PlayerStatistics>(EMPTY_STATISTICS);
  const [status, setStatus] = useState<StorageStatus>({ mode: 'memory', available: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const store = getStatisticsStore();
    let active = true;

    const sync = (): void => {
      if (!active) {
        return;
      }
      setStatistics(store.getStatistics());
      setStatus(store.getStatus());
      setLoading(false);
    };

    const unsubscribe = store.subscribe(sync);
    void store.initialize().then(sync);

    const onStorage = (event: StorageEvent): void => {
      if (event.key?.startsWith('kvvfs-')) {
        void store.refresh();
      }
    };
    const onVisibility = (): void => {
      if (document.visibilityState === 'visible') {
        void store.refresh();
      }
    };

    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const recordGame = useCallback(async (result: GameResult) => {
    const store = getStatisticsStore();
    await store.initialize();
    await store.recordGame(result);
  }, []);

  return { statistics, status, loading, recordGame };
}
