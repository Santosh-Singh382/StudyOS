import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useExams } from '../hooks/useExams';
import { useSubjects } from '../hooks/useSubjects';
import ExamForm from '../components/ExamForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import { formatShortDate } from '../utils/format';
import { examCountdown } from '../utils/planner';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_STYLES = {
  UPCOMING: 'bg-violet-50 text-violet-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

const TONE_STYLES = {
  urgent: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  calm: 'bg-violet-50 text-violet-700',
  neutral: 'bg-slate-100 text-slate-600',
};

export default function Exams() {
  const [filter, setFilter] = useState('');
  const { exams, loading, error, reload, add, update, remove, transition } = useExams({
    status: filter || undefined,
  });
  const { subjects } = useSubjects();

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

  const handleTransition = async (exam, action) => {
    setSubmitError(null);
    try {
      await transition(exam, action);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Exams</h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep every exam date in view with countdowns and linked subjects.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setSubmitError(null); setShowCreate(true); }}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          New exam
        </button>
      </div>

      <div role="tablist" aria-label="Filter exams by status" className="mt-6 flex flex-wrap gap-2">
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

      {loading && <LoadingState label="Loading exams…" />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && exams.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title={filter ? `No ${filter.toLowerCase()} exams` : 'No exams yet'}
            message={
              filter
                ? 'Try a different filter, or add a new exam.'
                : 'Add your upcoming exams so the planner and dashboard can count down for you.'
            }
            action={
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
              >
                Add your first exam
              </button>
            }
          />
        </div>
      )}

      {!loading && !error && exams.length > 0 && (
        <div className="mt-6 space-y-4">
          {exams.map((exam) => {
            const countdown = examCountdown(exam.daysUntil, exam.status);
            const shown = [...exams]
              .filter((item) => item.status === 'UPCOMING')
              .sort((a, b) => (a.daysUntil ?? 0) - (b.daysUntil ?? 0))
              .findIndex((item) => item.id === exam.id);
            const isNearest = exam.status === 'UPCOMING' && shown === 0;
            return (
              <article
                key={exam.id}
                data-testid="exam-card"
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
                  isNearest ? 'border-violet-300 ring-1 ring-violet-100' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TONE_STYLES[countdown.tone]}`}
                        data-testid="exam-countdown"
                      >
                        {countdown.label}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[exam.status]}`}
                      >
                        {exam.status.charAt(0) + exam.status.slice(1).toLowerCase()}
                      </span>
                      {isNearest && (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                          Next up
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        to={`/exams/${exam.id}`}
                        className="truncate text-base font-semibold text-slate-900 hover:text-violet-700"
                      >
                        {exam.title}
                      </Link>
                      <span className="text-xs font-medium text-slate-400">
                        {exam.priority.charAt(0) + exam.priority.slice(1).toLowerCase()} priority
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500" data-testid="exam-date-line">
                      {formatShortDate(exam.examDate)}
                      {exam.examTime ? ` at ${exam.examTime}` : ''}
                      {exam.location ? ` · ${exam.location}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {exam.status === 'UPCOMING' && (
                      <button
                        type="button"
                        onClick={() => handleTransition(exam, 'complete')}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                      >
                        Mark done
                      </button>
                    )}
                    {exam.status === 'UPCOMING' && (
                      <button
                        type="button"
                        onClick={() => handleTransition(exam, 'cancel')}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                      >
                        Cancel
                      </button>
                    )}
                    {exam.status !== 'UPCOMING' && (
                      <button
                        type="button"
                        onClick={() => handleTransition(exam, 'reopen')}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                      >
                        Reopen
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setSubmitError(null); setEditing(exam); }}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSubmitError(null); setDeleting(exam); }}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {exam.subjects.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exam.subjects.map((subject) => (
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
                  </div>
                )}

                {exam.examProgress > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>Subject coverage</span>
                      <span className="font-medium text-slate-600">{exam.examProgress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all duration-300"
                        style={{ width: `${exam.examProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {showCreate && (
        <Modal open onClose={() => setShowCreate(false)} title="Create exam" wide>
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <ExamForm subjects={subjects} onSubmit={handleCreate} />
        </Modal>
      )}

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Edit exam" wide>
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <ExamForm initial={editing} subjects={subjects} onSubmit={handleUpdate} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          open
          title="Delete exam"
          message={`Are you sure you want to delete "${deleting.title}"?`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}