import { useEffect, useState } from 'react';
import { getApiHealth } from '../lib/api';

export type ApiHealthState = 'checking' | 'online' | 'offline';

export function useApiHealth(): ApiHealthState {
  const [state, setState] = useState<ApiHealthState>('checking');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);

    void getApiHealth(controller.signal)
      .then(() => setState('online'))
      .catch(() => setState('offline'))
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return state;
}
