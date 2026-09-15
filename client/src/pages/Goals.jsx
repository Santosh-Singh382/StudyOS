import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGoals } from '../hooks/useGoals';
import { useSubjects } from '../hooks/useSubjects';
import { useExams } from '../hooks/useExams';
import GoalForm from '../components/GoalForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ProgressBar from '../components/ProgressBar';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import { formatShortDate, relativeDueLabel } from '../utils/format';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_STYLES = {
  ACTIVE: 'bg-violet-50 text-violet-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  PAUSED: 'bg-amber-50 text-amber-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

export default function Goals() {
  const [filter, setFilter] = useState('');
  const { goals, loading, error, reload, add, update, remove, toggleComplete } = useGoals({
    status: filter || undefined,
  });
  const { subjects } = useSubjects();
  const { exams } = useExams();

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitError, setSubmitError] = useState(null);

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

  const handleToggle = async (goal) => {
    setSubmitError(null);
    try {
      await toggleComplete(goal);
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

  return (
    <section className="mx-auto w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Goals</h1>
          <p className="mt-1 text-sm text-slate-500">
            Break big outcomes into milestones and track your progress.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setSubmitError(null); setShowCreate(true); }}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          New goal
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Filter goals by status"
        className="mt-6 flex flex-wrap gap-2"
      >
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            onClick={() => setFilter(item.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
              filter === item.value
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && <LoadingState label="Loading goals…" />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && goals.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title={filter ? `No ${filter.toLowerCase()} goals` : 'No goals yet'}
            message={
              filter
                ? 'Try a different filter, or create a new goal.'
                : 'Set a goal, add milestones, and watch your progress grow.'
            }
            action={
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
              >
                Create your first goal
              </button>
            }
          />
        </div>
      )}

      {!loading && !error && goals.length > 0 && (
        <div className="mt-6 space-y-4">
          {goals.map((goal) => {
            const due = relativeDueLabel(goal.targetDate);
            return (
              <article
                key={goal.id}
                data-testid="goal-card"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/goals/${goal.id}`}
                        className="truncate text-base font-semibold text-slate-900 hover:text-violet-700"
                      >
                        {goal.title}
                      </Link>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[goal.status] ?? STATUS_STYLES.ACTIVE}`}
                      >
                        {goal.status.charAt(0) + goal.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {goal.type === 'SHORT_TERM'
                        ? 'Short term'
                        : goal.type === 'LONG_TERM'
                          ? 'Long term'
                          : goal.type === 'HABIT'
                            ? 'Habit'
                            : 'Subject'}{' '}
                      · {goal.priority.charAt(0) + goal.priority.slice(1).toLowerCase()} priority
                      {goal.targetDate && (
                        <>
                          {' '}
                          · Target{' '}
                          <span data-testid="goal-target">{formatShortDate(goal.targetDate)}</span>
                          {due && <span className="text-slate-400"> ({due})</span>}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(goal)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
                        goal.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                      }`}
                    >
                      {goal.status === 'COMPLETED' ? 'Reopen' : 'Complete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSubmitError(null); setEditing(goal); }}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSubmitError(null); setDeleting(goal); }}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{goal.description}</p>
                )}

                {goal.relatedSubjects.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {goal.relatedSubjects.map((subject) => (
                      <span
                        key={subject.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                      >
                        {subject.color && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: subject.color }}
                            aria-hidden="true"
                          />
                        )}
                        {subject.name}
                      </span>
                    ))}
                    {goal.relatedExam && (
                      <Link
                        to={`/exams/${goal.relatedExam.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        {goal.relatedExam.title}
                      </Link>
                    )}
                  </div>
                )}

                <div className="mt-4">
                  <ProgressBar value={goal.milestoneStats.total ? goal.progress : 0} max={100} color="#7c3aed" />
                  <p className="mt-1 text-xs text-slate-500">
                    {goal.milestoneStats.completed} of {goal.milestoneStats.total} milestones completed
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showCreate && (
        <Modal open onClose={() => setShowCreate(false)} title="Create goal" wide>
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <GoalForm subjects={subjects} exams={exams} onSubmit={handleCreate} />
        </Modal>
      )}

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Edit goal" wide>
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <GoalForm initial={editing} subjects={subjects} exams={exams} onSubmit={handleUpdate} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          open
          title="Delete goal"
          message={`Are you sure you want to delete "${deleting.title}"? All of its milestones will also be deleted.`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}