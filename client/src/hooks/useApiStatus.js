import { useCallback, useEffect, useState } from 'react';
import { getHealth, getReadiness } from '../services/health.js';

export function useApiStatus() {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState({ loading: true, api: null, database: null });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const next = { loading: false, api: 'down', database: 'down' };
      try {
        const health = await getHealth();
        next.api = health.status === 'ok' ? 'up' : 'down';
      } catch {
        // API unreachable: keep "down"
      }
      try {
        const readiness = await getReadiness();
        next.database = readiness.database === 'up' ? 'up' : 'down';
      } catch {
        // Database not ready: keep "down"
      }
      if (!cancelled) setStatus(next);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setStatus({ loading: true, api: null, database: null });
    setAttempt((value) => value + 1);
  }, []);

  return { ...status, retry };
}