import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useExam } from '../hooks/useExam';
import { useSubjects } from '../hooks/useSubjects';
import ExamForm from '../components/ExamForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { LoadingState, ErrorState } from '../components/States';
import { formatShortDate } from '../utils/format';
import { examCountdown } from '../utils/planner';

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

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exam, loading, error, reload, update, remove, complete, cancel, reopen } = useExam(id);
  const { subjects } = useSubjects();

  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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
      navigate('/exams');
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const runTransition = async (fn) => {
    setSubmitError(null);
    try {
      await fn();
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  if (loading) return <LoadingState label="Loading exam…" />;

  if (!loading && (error || !exam)) {
    return (
      <div className="mt-8">
        <ErrorState message={error || 'Exam not found.'} onRetry={reload} />
        <div className="mt-4 text-center">
          <Link to="/exams" className="text-sm font-medium text-violet-600 hover:text-violet-700">
            ← Back to exams
          </Link>
        </div>
      </div>
    );
  }

  const countdown = examCountdown(exam.daysUntil, exam.status);
  const bigLabel =
    exam.status === 'COMPLETED'
      ? 'Exam completed'
      : exam.status === 'CANCELLED'
        ? 'Cancelled'
        : exam.daysUntil > 0
          ? `${exam.daysUntil} days left`
          : 'Today';

  return (
    <section className="mx-auto w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/exams" className="text-sm font-medium text-violet-600 hover:text-violet-700">
        &larr; Back to exams
      </Link>

      {submitError && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {submitError}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${TONE_STYLES[countdown.tone]}`}
              data-testid="exam-countdown"
            >
              {countdown.label}
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{exam.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[exam.status]}`}
              >
                {exam.status.charAt(0) + exam.status.slice(1).toLowerCase()}
              </span>
              <span>{exam.priority.charAt(0) + exam.priority.slice(1).toLowerCase()} priority</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {exam.status === 'UPCOMING' && (
              <button
                type="button"
                onClick={() => runTransition(complete)}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                Mark complete
              </button>
            )}
            {exam.status === 'UPCOMING' && (
              <button
                type="button"
                onClick={() => runTransition(cancel)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                Cancel exam
              </button>
            )}
            {exam.status !== 'UPCOMING' && (
              <button
                type="button"
                onClick={() => runTransition(reopen)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                Reopen
              </button>
            )}
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

        <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
          <div className="bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Big day</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{bigLabel}</p>
          </div>
          <div className="bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">When</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatShortDate(exam.examDate)}
              {exam.examTime ? ` at ${exam.examTime}` : ''}
            </p>
          </div>
          <div className="bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Where</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{exam.location || 'To be confirmed'}</p>
          </div>
        </div>

        {exam.description && (
          <p className="mt-5 text-sm leading-relaxed text-slate-600">{exam.description}</p>
        )}

        {exam.subjects.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold text-slate-700">Covered subjects</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {exam.subjects.map((subject) => (
                <Link
                  key={subject.id}
                  to={`/subjects/${subject.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                >
                  {subject.color && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: subject.color }}
                      aria-hidden="true"
                    />
                  )}
                  {subject.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {exam.subjects.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-700">Subject coverage</h2>
              <span className="text-sm font-bold text-violet-700">{exam.examProgress}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-violet-600 transition-all duration-300"
                style={{ width: `${exam.examProgress}%` }}
                role="progressbar"
                aria-valuenow={exam.examProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Share of topics across the linked subjects that are completed.
            </p>
          </div>
        )}
      </div>

      {editOpen && (
        <Modal open onClose={() => setEditOpen(false)} title="Edit exam" wide>
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <ExamForm initial={exam} subjects={subjects} onSubmit={handleUpdate} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          open
          title="Delete exam"
          message={`Are you sure you want to delete "${exam.title}"?`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(false)}
        />
      )}
    </section>
  );
}