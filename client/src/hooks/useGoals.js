import { useCallback, useEffect, useState } from 'react';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  uncompleteGoal,
} from '../services/goals';

export function useGoals({ status } = {}) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (status) params.status = status;
      const data = await getGoals(params);
      setGoals(data.goals);
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
    const result = await createGoal(data);
    await load();
    return result;
  };

  const update = async (id, data) => {
    const result = await updateGoal(id, data);
    setGoals((prev) => prev.map((goal) => (goal.id === id ? result.goal : goal)));
    return result;
  };

  const remove = async (id) => {
    const result = await deleteGoal(id);
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
    return result;
  };

  const toggleComplete = async (goal) => {
    const result =
      goal.status === 'COMPLETED'
        ? await uncompleteGoal(goal.id)
        : await completeGoal(goal.id);
    setGoals((prev) => prev.map((item) => (item.id === goal.id ? result.goal : item)));
    return result;
  };

  return { goals, loading, error, reload: load, add, update, remove, toggleComplete };
}