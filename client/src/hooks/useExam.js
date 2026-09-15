import { useCallback, useEffect, useState } from 'react';
import {
  getExam,
  updateExam,
  deleteExam,
  completeExam,
  cancelExam,
  reopenExam,
} from '../services/exams';

export function useExam(id) {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExam(id);
      setExam(data.exam);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const replace = (next) => {
    setExam(next);
    return next;
  };

  const update = async (data) => {
    const result = await updateExam(id, data);
    return replace(result.exam);
  };

  const complete = async () => {
    const result = await completeExam(id);
    return replace(result.exam);
  };

  const cancel = async () => {
    const result = await cancelExam(id);
    return replace(result.exam);
  };

  const reopen = async () => {
    const result = await reopenExam(id);
    return replace(result.exam);
  };

  const remove = () => deleteExam(id);

  return { exam, loading, error, reload: load, update, complete, cancel, reopen, remove };
}