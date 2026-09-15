import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGoal } from '../hooks/useGoal';
import { useSubjects } from '../hooks/useSubjects';
import { useExams } from '../hooks/useExams';
import GoalForm from '../components/GoalForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { LoadingState, ErrorState } from '../components/States';
import { formatShortDate } from '../utils/format';

const STATUS_STYLES = {
  ACTIVE: 'bg-violet-50 text-violet-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  PAUSED: 'bg-amber-50 text-amber-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

const inputClass =
  'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100';

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    goal,
    loading,
    error,
    reload,
    update,
    toggleComplete,
    remove,
    addMilestone,
    updateMilestoneItem,
    removeMilestone,
    toggleMilestone,
  } = useGoal(id);
  const { subjects } = useSubjects();
  const { exams } = useExams();

  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [milestoneText, setMilestoneText] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [editText, setEditText] = useState('');

  const handleUpdate = async (values) => {
    setSubmitError(null);
    try {
      await update(values);
      setEditOpen(false);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await remove();
      navigate('/goals');
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    const title = milestoneText.trim();
    if (!title) return;
    setSubmitError(null);
    try {
      await addMilestone({ title, targetDate: milestoneDate ? `${milestoneDate}T12:00:00` : null });
      setMilestoneText('');
      setMilestoneDate('');
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleRemoveMilestone = async (milestone) => {
    setSubmitError(null);
    try {
      await removeMilestone(milestone.id);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleToggleMilestone = async (milestone) => {
    setSubmitError(null);
    try {
      await toggleMilestone(milestone);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const startEdit = (milestone) => {
    setEditingMilestone(milestone.id);
    setEditText(milestone.title);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const title = editText.trim();
    if (!title) return;
    setSubmitError(null);
    try {
      await updateMilestoneItem(editingMilestone, { title });
      setEditingMilestone(null);
      setEditText('');
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  if (loading) return <LoadingState label="Loading goal…" />;

  if (!loading && (error || !goal)) {
    return (
      <div className="mt-8">
        <ErrorState message={error || 'Goal not found.'} onRetry={reload} />
        <div className="mt-4 text-center">
          <Link to="/goals" className="text-sm font-medium text-violet-600 hover:text-violet-700">
            ← Back to goals
          </Link>
        </div>
      </div>
    );
  }

  const milestones = goal.milestones || [];
  const completedCount = milestones.filter((item) => item.status === 'COMPLETED').length;

  return (
    <section className="mx-auto w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/goals" className="text-sm font-medium text-violet-600 hover:text-violet-700">
        &larr; Back to goals
      </Link>

      {submitError && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {submitError}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{goal.title}</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[goal.status]}`}
            >
              {goal.status.charAt(0) + goal.status.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {goal.type === 'SHORT_TERM'
              ? 'Short term goal'
              : goal.type === 'LONG_TERM'
                ? 'Long term goal'
                : goal.type === 'HABIT'
                  ? 'Habit goal'
                  : 'Subject goal'}{' '}
            · {goal.priority.charAt(0) + goal.priority.slice(1).toLowerCase()} priority
            {goal.targetDate && <> · Target {formatShortDate(goal.targetDate)}</>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setSubmitError(null); toggleComplete(goal).catch((err) => setSubmitError(err.message)); }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
              goal.status === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            {goal.status === 'COMPLETED' ? 'Reopen' : 'Mark complete'}
          </button>
          <button
            type="button"
            onClick={() => { setSubmitError(null); setEditOpen(true); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => { setSubmitError(null); setDeleting(true); }}
            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      {goal.description && <p className="mt-3 text-sm leading-relaxed text-slate-600">{goal.description}</p>}

      {(goal.relatedSubjects.length > 0 || goal.relatedExam) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {goal.relatedSubjects.map((subject) => (
            <span
              key={subject.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
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
              className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              {goal.relatedExam.title}
            </Link>
          )}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Progress</h2>
          <span className="text-sm font-bold text-violet-700">{goal.progress}%</span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-violet-600 transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
            role="progressbar"
            aria-valuenow={goal.progress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {completedCount} of {milestones.length} milestones completed
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Milestones</h2>
          <span className="text-xs text-slate-500">{milestones.length}</span>
        </div>

        <form
          onSubmit={handleAddMilestone}
          className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={milestoneText}
              onChange={(e) => setMilestoneText(e.target.value)}
              placeholder="Add a milestone, e.g. Finish Trigonometry"
              aria-label="New milestone title"
              className={`${inputClass} sm:flex-1`}
            />
            <input
              type="date"
              value={milestoneDate}
              onChange={(e) => setMilestoneDate(e.target.value)}
              aria-label="Milestone target date"
              className={`${inputClass} sm:w-44`}
            />
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              Add
            </button>
          </div>
        </form>

        {milestones.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
            No milestones yet — break this goal into small, checkable steps.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {milestones.map((milestone) => (
              <li
                key={milestone.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => handleToggleMilestone(milestone)}
                  aria-label={milestone.status === 'COMPLETED' ? 'Reopen milestone' : 'Complete milestone'}
                  aria-pressed={milestone.status === 'COMPLETED'}
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
                    milestone.status === 'COMPLETED'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white text-transparent hover:border-violet-400'
                  }`}
                >
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m2.5 6.5 2.5 2.5 4.5-5" />
                  </svg>
                </button>

                {editingMilestone === milestone.id ? (
                  <form onSubmit={submitEdit} className="flex flex-1 gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      className={`${inputClass} flex-1`}
                    />
                    <button type="submit" className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingMilestone(null)}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${
                        milestone.status === 'COMPLETED'
                          ? 'text-slate-400 line-through'
                          : 'text-slate-800'
                      }`}
                    >
                      {milestone.title}
                    </p>
                    {milestone.targetDate && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatShortDate(milestone.targetDate)}
                      </p>
                    )}
                  </div>
                )}

                {editingMilestone !== milestone.id && (
                  <div className="flex flex-shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(milestone)}
                      className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(milestone)}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {editOpen && (
        <Modal open onClose={() => setEditOpen(false)} title="Edit goal" wide>
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <GoalForm initial={goal} subjects={subjects} exams={exams} onSubmit={handleUpdate} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          open
          title="Delete goal"
          message={`Are you sure you want to delete "${goal.title}"? All of its milestones will also be deleted.`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(false)}
        />
      )}
    </section>
  );
}