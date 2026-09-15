import { useCallback, useEffect, useState } from 'react';
import {
  getGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  uncompleteGoal,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  completeMilestone,
  uncompleteMilestone,
} from '../services/goals';

export function useGoal(id) {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGoal(id);
      setGoal(data.goal);
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
    setGoal(next);
    return next;
  };

  const update = async (data) => {
    const result = await updateGoal(id, data);
    return replace(result.goal);
  };

  const toggleComplete = async () => {
    const result =
      goal.status === 'COMPLETED'
        ? await uncompleteGoal(id)
        : await completeGoal(id);
    return replace(result.goal);
  };

  const remove = () => deleteGoal(id);

  const addMilestone = async (data) => {
    const result = await createMilestone(id, data);
    await load();
    return result;
  };

  const updateMilestoneItem = async (milestoneId, data) => {
    const result = await updateMilestone(id, milestoneId, data);
    await load();
    return result;
  };

  const removeMilestone = async (milestoneId) => {
    const result = await deleteMilestone(id, milestoneId);
    await load();
    return result;
  };

  const toggleMilestone = async (milestone) => {
    const result =
      milestone.status === 'COMPLETED'
        ? await uncompleteMilestone(id, milestone.id)
        : await completeMilestone(id, milestone.id);
    await load();
    return result;
  };

  return {
    goal,
    loading,
    error,
    reload: load,
    update,
    toggleComplete,
    remove,
    addMilestone,
    updateMilestoneItem,
    removeMilestone,
    toggleMilestone,
  };
}