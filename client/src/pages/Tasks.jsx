import { useEffect, useMemo, useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { getSubjects } from '../services/subjects';
import { getTopics } from '../services/topics';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SelectField from '../components/SelectField';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import { TASK_STATUSES, TASK_PRIORITIES } from '../utils/constants';

const STATUS_TABS = [{ value: '', label: 'All' }, ...TASK_STATUSES];

export default function Tasks() {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const filters = useMemo(
    () => ({
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      subject: subjectFilter || undefined,
      topic: topicFilter || undefined,
      sort,
    }),
    [statusFilter, priorityFilter, subjectFilter, topicFilter, sort]
  );

  const { tasks, loading, error, reload, add, update, remove, toggleComplete, pendingCount } =
    useTasks(filters);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([getSubjects(), getTopics({ sort: 'name' })])
      .then(([subjectData, topicData]) => {
        if (!active) return;
        setSubjects(subjectData.subjects);
        setTopics(topicData.topics);
      })
      .catch(() => {
        if (!active) return;
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleTopicsForFilter = useMemo(() => {
    if (!subjectFilter) return topics;
    return topics.filter((topic) => topic.subject?.id === subjectFilter);
  }, [topics, subjectFilter]);

  const handleResetTopicFilter = (value) => {
    setSubjectFilter(value);
    setTopicFilter('');
  };

  const handleCreate = async (values) => {
    setSubmitError(null);
    try {
      await add(values);
      setShowCreate(false);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleUpdate = async (values) => {
    setSubmitError(null);
    try {
      await update(editing.id, values);
      setEditing(null);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleting.id);
      setDeleting(null);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const hasFilters = Boolean(statusFilter || priorityFilter || subjectFilter || topicFilter);

  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setSubjectFilter('');
    setTopicFilter('');
  };

  return (
    <section className="mx-auto w-full max-w-4xl flex-1 flex-col px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">
            {tasks.length} total · {pendingCount} pending
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSubmitError(null);
            setShowCreate(true);
          }}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          New task
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            aria-pressed={statusFilter === tab.value}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
              statusFilter === tab.value
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Subject"
          name="subjectFilter"
          value={subjectFilter}
          onChange={(e) => handleResetTopicFilter(e.target.value)}
          options={subjects.map((subject) => ({ value: subject.id, label: subject.name }))}
          placeholder="All subjects"
        />
        <SelectField
          label="Topic"
          name="topicFilter"
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          options={visibleTopicsForFilter.map((topic) => ({ value: topic.id, label: topic.name }))}
          placeholder="All topics"
        />
        <SelectField
          label="Priority"
          name="priorityFilter"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={TASK_PRIORITIES}
          placeholder="All priorities"
        />
        <SelectField
          label="Sort"
          name="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          options={[
            { value: 'newest', label: 'Newest first' },
            { value: 'due', label: 'Due date' },
            { value: 'priority', label: 'Priority' },
          ]}
        />
      </div>

      {hasFilters && (
        <div className="mt-3">
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            Clear filters
          </button>
        </div>
      )}

      {loading && <LoadingState label="Loading tasks…" />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && tasks.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title={hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
            message={
              hasFilters
                ? 'Try adjusting or clearing the filters.'
                : 'Create a task to start tracking your study activity.'
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="mt-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                  Create your first task
                </button>
              )
            }
          />
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <ul className="mt-6 space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={toggleComplete}
              onEdit={(t) => {
                setSubmitError(null);
                setEditing(t);
              }}
              onDelete={(t) => {
                setSubmitError(null);
                setDeleting(t);
              }}
            />
          ))}
        </ul>
      )}

      {showCreate && (
        <Modal open onClose={() => setShowCreate(false)} title="Create task" wide>
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <TaskForm subjects={subjects} topics={topics} onSubmit={handleCreate} />
        </Modal>
      )}

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Edit task" wide>
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <TaskForm subjects={subjects} topics={topics} initial={editing} onSubmit={handleUpdate} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          open
          title="Delete task"
          message={`Are you sure you want to delete "${deleting.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}