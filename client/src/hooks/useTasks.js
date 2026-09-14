import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  uncompleteTask,
} from '../services/tasks';

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks(filters);
      setTasks(data.tasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (data) => {
    const result = await createTask(data);
    setTasks((prev) => [result.task, ...prev]);
    return result.task;
  };

  const update = async (id, data) => {
    const result = await updateTask(id, data);
    setTasks((prev) => prev.map((task) => (task.id === id ? result.task : task)));
    return result.task;
  };

  const remove = async (id) => {
    const result = await deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
    return result;
  };

  const complete = async (id) => {
    const result = await completeTask(id);
    setTasks((prev) => prev.map((task) => (task.id === id ? result.task : task)));
    return result.task;
  };

  const uncomplete = async (id) => {
    const result = await uncompleteTask(id);
    setTasks((prev) => prev.map((task) => (task.id === id ? result.task : task)));
    return result.task;
  };

  const toggleComplete = async (task) => {
    return task.status === 'COMPLETED' ? uncomplete(task.id) : complete(task.id);
  };

  const pendingCount = useMemo(
    () => tasks.filter((task) => task.status !== 'COMPLETED').length,
    [tasks]
  );

  return {
    tasks,
    loading,
    error,
    reload: load,
    add,
    update,
    remove,
    complete,
    uncomplete,
    toggleComplete,
    pendingCount,
  };
}