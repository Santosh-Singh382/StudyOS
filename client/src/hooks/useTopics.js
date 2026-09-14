import { useCallback, useEffect, useState } from 'react';
import { getTopics, createTopic, updateTopic, deleteTopic } from '../services/topics';

export function useTopics({ subject, status, priority, sort } = {}) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopics({ subject, status, priority, sort });
      setTopics(data.topics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [subject, status, priority, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (data) => {
    const result = await createTopic(data);
    setTopics((prev) => [result.topic, ...prev]);
    return result;
  };

  const update = async (id, data) => {
    const result = await updateTopic(id, data);
    setTopics((prev) => prev.map((topic) => (topic.id === id ? result.topic : topic)));
    return result;
  };

  const remove = async (id) => {
    const result = await deleteTopic(id);
    setTopics((prev) => prev.filter((topic) => topic.id !== id));
    return result;
  };

  return { topics, loading, error, reload: load, add, update, remove };
}