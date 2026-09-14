import { useCallback, useEffect, useState } from 'react';
import { getSubject } from '../services/subjects';
import { getTopics } from '../services/topics';

export function useSubjectDetail(id) {
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subjectData, topicsData] = await Promise.all([
        getSubject(id),
        getTopics({ subject: id, sort: 'name' }),
      ]);
      setSubject(subjectData.subject);
      setTopics(topicsData.topics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const addTopic = (topic) => {
    setTopics((prev) => [...prev, topic].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const replaceTopic = (topic) => {
    setTopics((prev) => prev.map((item) => (item.id === topic.id ? topic : item)));
  };

  const removeTopic = (id) => {
    setTopics((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    subject,
    topics,
    loading,
    error,
    reload: load,
    addTopic,
    replaceTopic,
    removeTopic,
  };
}