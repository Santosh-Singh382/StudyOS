import { useCallback, useEffect, useState } from 'react';
import { getHealth } from '../services/health';

const INITIAL = { backend: 'checking', database: 'checking' };

export function useHealth() {
  const [status, setStatus] = useState(INITIAL);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(true);

  const check = useCallback(async () => {
    setChecking(true);
    setStatus(INITIAL);
    setError(null);
    try {
      const data = await getHealth();
      setStatus({
        backend: 'connected',
        database: data.database === 'connected' ? 'connected' : 'disconnected',
      });
    } catch (err) {
      setStatus({ backend: 'disconnected', database: 'disconnected' });
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { status, error, checking, retry: check };
}