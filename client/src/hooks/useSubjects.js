import { useCallback, useEffect, useState } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../services/subjects';

export function useSubjects({ sort = 'name' } = {}) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubjects({ sort });
      setSubjects(data.subjects);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (data) => {
    const result = await createSubject(data);
    setSubjects((prev) => [...prev, result.subject].sort((a, b) => a.name.localeCompare(b.name)));
    return result;
  };

  const update = async (id, data) => {
    const result = await updateSubject(id, data);
    setSubjects((prev) =>
      prev.map((subject) => (subject.id === id ? result.subject : subject))
    );
    return result;
  };

  const remove = async (id) => {
    const result = await deleteSubject(id);
    setSubjects((prev) => prev.filter((subject) => subject.id !== id));
    return result;
  };

  return { subjects, loading, error, reload: load, add, update, remove };
}