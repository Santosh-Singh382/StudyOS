import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSubjectDetail } from '../hooks/useSubjectDetail';
import { updateSubject, deleteSubject } from '../services/subjects';
import { createTopic, updateTopic, deleteTopic } from '../services/topics';
import SubjectForm from '../components/SubjectForm';
import TopicForm from '../components/TopicForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import { TOPIC_STATUSES, STATUS_HEX, PRIORITY_HEX } from '../utils/constants';

const STATUS_LABELS = Object.fromEntries(TOPIC_STATUSES.map((s) => [s.value, s.label]));

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    subject,
    topics,
    loading,
    error,
    reload,
    addTopic,
    replaceTopic,
    removeTopic,
  } = useSubjectDetail(id);

  const [showAddTopic, setShowAddTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingSubject, setEditingSubject] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(false);
  const [deletingTopic, setDeletingTopic] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  if (loading) return <LoadingState label="Loading subject…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!subject) return <ErrorState message="Subject not found." onRetry={reload} />;

  const handleAddTopic = async (values) => {
    setSubmitError(null);
    try {
      const result = await createTopic(values);
      addTopic(result.topic);
      setShowAddTopic(false);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleUpdateTopic = async (values) => {
    setSubmitError(null);
    try {
      const result = await updateTopic(editingTopic.id, values);
      replaceTopic(result.topic);
      setEditingTopic(null);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleDeleteTopic = async () => {
    try {
      await deleteTopic(deletingTopic.id);
      removeTopic(deletingTopic.id);
      setDeletingTopic(null);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleUpdateSubject = async (values) => {
    setSubmitError(null);
    try {
      await updateSubject(subject.id, values);
      setEditingSubject(false);
      reload();
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleDeleteSubject = async () => {
    try {
      await deleteSubject(subject.id);
      navigate('/subjects', { replace: true });
    } catch (err) {
      setSubmitError(err.message);
      setDeletingSubject(false);
    }
  };

  const completedInSubjects = topics.reduce((sum, topic) => sum + topic.completedHours, 0);

  return (
    <section className="mx-auto w-full max-w-4xl flex-1 flex-col px-6 py-10">
      <Link
        to="/subjects"
        className="text-sm font-medium text-violet-600 hover:text-violet-700"
      >
        &larr; All subjects
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {subject.color && (
            <span
              className="inline-block h-5 w-5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: subject.color }}
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{subject.name}</h1>
            {subject.description && (
              <p className="mt-1 text-sm text-slate-500">{subject.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setSubmitError(null); setEditingSubject(true); }}
            className="rounded-lg bg-transparent px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => { setSubmitError(null); setDeletingSubject(true); }}
            className="rounded-lg bg-transparent px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <ProgressBar
            value={subject.completedHours}
            max={subject.targetHours}
            color={subject.color || '#7c3aed'}
          />
          <button
            type="button"
            onClick={() => { setSubmitError(null); setShowAddTopic(true); }}
            className="flex-shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            Add topic
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Topics
            <span className="ml-2 text-sm font-normal text-slate-400">
              {topics.length} · {completedInSubjects}hr logged
            </span>
          </h2>
        </div>

        {topics.length === 0 && (
          <div className="mt-4">
            <EmptyState
              title="No topics in this subject"
              message="Add a topic to start tracking what you are studying here."
              action={
                <button
                  type="button"
                  onClick={() => setShowAddTopic(true)}
                  className="mt-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                  Add a topic
                </button>
              }
            />
          </div>
        )}

        {topics.length > 0 && (
          <ul className="mt-4 space-y-3">
            {topics.map((topic) => (
              <li
                key={topic.id}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{topic.name}</p>
                  {topic.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {topic.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      label={STATUS_LABELS[topic.status] || topic.status}
                      color={STATUS_HEX[topic.status] || '#64748b'}
                    />
                    <Badge
                      label={`${topic.priority} priority`}
                      color={PRIORITY_HEX[topic.priority] || '#64748b'}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-40 flex-shrink-0">
                    <ProgressBar
                      value={topic.completedHours}
                      max={topic.estimatedHours}
                      color={subject.color || '#7c3aed'}
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => { setSubmitError(null); setEditingTopic(topic); }}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSubmitError(null); setDeletingTopic(topic); }}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAddTopic && (
        <Modal open onClose={() => setShowAddTopic(false)} title="Add topic">
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <TopicForm fixedSubject={subject.id} onSubmit={handleAddTopic} />
        </Modal>
      )}

      {editingTopic && (
        <Modal open onClose={() => setEditingTopic(null)} title="Edit topic">
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <TopicForm
            fixedSubject={subject.id}
            initial={editingTopic}
            onSubmit={handleUpdateTopic}
          />
        </Modal>
      )}

      {editingSubject && (
        <Modal open onClose={() => setEditingSubject(false)} title="Edit subject">
          {submitError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {submitError}
            </div>
          )}
          <SubjectForm initial={subject} onSubmit={handleUpdateSubject} />
        </Modal>
      )}

      {deletingSubject && (
        <ConfirmDialog
          open
          title="Delete subject"
          message={`Are you sure you want to delete "${subject.name}"? All topics in this subject will also be deleted.`}
          onConfirm={handleDeleteSubject}
          onClose={() => setDeletingSubject(false)}
        />
      )}

      {deletingTopic && (
        <ConfirmDialog
          open
          title="Delete topic"
          message={`Are you sure you want to delete "${deletingTopic.name}"? This cannot be undone.`}
          onConfirm={handleDeleteTopic}
          onClose={() => setDeletingTopic(null)}
        />
      )}
    </section>
  );
}