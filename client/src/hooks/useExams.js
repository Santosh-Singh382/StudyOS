import { useCallback, useEffect, useState } from 'react';
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  completeExam,
  cancelExam,
  reopenExam,
} from '../services/exams';

export function useExams({ status } = {}) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (status) params.status = status;
      const data = await getExams(params);
      setExams(data.exams);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (data) => {
    const result = await createExam(data);
    await load();
    return result;
  };

  const update = async (id, data) => {
    const result = await updateExam(id, data);
    setExams((prev) => prev.map((exam) => (exam.id === id ? result.exam : exam)));
    return result;
  };

  const remove = async (id) => {
    const result = await deleteExam(id);
    setExams((prev) => prev.filter((exam) => exam.id !== id));
    return result;
  };

  const transition = async (exam, action) => {
    const result =
      action === 'complete'
        ? await completeExam(exam.id)
        : action === 'cancel'
          ? await cancelExam(exam.id)
          : await reopenExam(exam.id);
    setExams((prev) => prev.map((item) => (item.id === exam.id ? result.exam : item)));
    return result;
  };

  return { exams, loading, error, reload: load, add, update, remove, transition };
}