import { useEffect, useState } from 'react';
import { getPlannerOverview } from '../services/planner';

export function usePlannerOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getPlannerOverview()
      .then((data) => {
        if (active) setOverview(data.overview);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { overview, loading, error };
}