import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubjects } from '../hooks/useSubjects';
import SubjectForm from '../components/SubjectForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ProgressBar from '../components/ProgressBar';
import { LoadingState, EmptyState, ErrorState } from '../components/States';

export default function Subjects() {
  const { user } = useAuth();
  const { subjects, loading, error, reload, add, update, remove } = useSubjects();

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') {
      setSubmitError(null);
      setShowCreate(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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

  return (
    <section className="mx-auto w-full max-w-4xl flex-1 flex-col px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Organise your study by subject.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setSubmitError(null); setShowCreate(true); }}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          New subject
        </button>
      </div>

      {loading && <LoadingState label="Loading subjects…" />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && subjects.length === 0 && (
        <EmptyState
          title="No subjects yet"
          message="Subjects help you group related topics together and track your progress."
          action={
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="mt-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              Create your first subject
            </button>
          }
        />
      )}

      {!loading && !error && subjects.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/subjects/${subject.id}`}
                  className="flex items-center gap-2.5 font-semibold text-slate-900 hover:text-violet-700"
                >
                  {subject.color && (
                    <span
                      className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                  )}
                  {subject.name}
                </Link>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => { setSubmitError(null); setEditing(subject); }}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSubmitError(null); setDeleting(subject); }}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {subject.description && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {subject.description}
                </p>
              )}

              <div className="mt-4">
                <ProgressBar
                  value={subject.completedHours}
                  max={subject.targetHours}
                  color={subject.color || '#7c3aed'}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal open onClose={() => setShowCreate(false)} title="Create subject">
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <SubjectForm onSubmit={handleCreate} />
        </Modal>
      )}

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Edit subject">
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <SubjectForm initial={editing} onSubmit={handleUpdate} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          open
          title="Delete subject"
          message={`Are you sure you want to delete "${deleting.name}"? All topics in this subject will also be deleted.`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}