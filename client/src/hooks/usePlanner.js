import { useCallback, useState } from 'react';
import { getPlannerDay, getPlannerWeek } from '../services/planner';

export function usePlanner() {
  const [dayData, setDayData] = useState(null);
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async ({ view, dateKey }) => {
    setLoading(true);
    setError(null);
    try {
      if (view === 'week') {
        const data = await getPlannerWeek(dateKey);
        setWeekData(data.week);
      } else {
        const data = await getPlannerDay(dateKey);
        setDayData(data.day);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { dayData, weekData, loading, error, load };
}