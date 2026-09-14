import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSubjects } from '../hooks/useSubjects';
import { useTopics } from '../hooks/useTopics';
import Badge from '../components/Badge';
import SelectField from '../components/SelectField';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import { TOPIC_STATUSES, STATUS_HEX, PRIORITY_HEX } from '../utils/constants';

const STATUS_LABELS = Object.fromEntries(TOPIC_STATUSES.map((s) => [s.value, s.label]));

export default function Topics() {
  const { subjects, loading: subjectsLoading, error: subjectsError } = useSubjects();

  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const { topics, loading: topicsLoading, error: topicsError, reload } = useTopics({
    subject: subjectFilter || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    sort: 'name',
  });

  useEffect(() => {
    reload();
  }, [reload]);

  const hasFilters = Boolean(subjectFilter || statusFilter || priorityFilter);

  const clearFilters = () => {
    setSubjectFilter('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  return (
    <section className="mx-auto w-full max-w-4xl flex-1 flex-col px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All topics</h1>
        <p className="mt-1 text-sm text-slate-500">
          A view across every subject, with filters.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Subject"
          name="subjectFilter"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          options={subjects.map((subject) => ({ value: subject.id, label: subject.name }))}
          placeholder="All subjects"
        />
        <SelectField
          label="Status"
          name="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={TOPIC_STATUSES}
          placeholder="All statuses"
        />
        <SelectField
          label="Priority"
          name="priorityFilter"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={[
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
          ]}
          placeholder="All priorities"
        />
      </div>

      {(subjectsLoading || topicsLoading) && <LoadingState label="Loading topics…" />}
      {!subjectsLoading && !topicsLoading && (subjectsError || topicsError) && (
        <ErrorState message={subjectsError || topicsError} onRetry={reload} />
      )}

      {!subjectsLoading && !topicsLoading && !subjectsError && !topicsError && topics.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title={hasFilters ? 'No topics match your filters' : 'No topics yet'}
            message={
              hasFilters
                ? 'Try adjusting or clearing the filters.'
                : 'Add a topic from a subject page to see it here.'
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
              ) : undefined
            }
          />
        </div>
      )}

      {!subjectsLoading && !topicsLoading && !subjectsError && !topicsError && topics.length > 0 && (
        <ul className="mt-6 space-y-3">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{topic.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {topic.subject?.name && (
                    <Link
                      to={`/subjects/${topic.subject.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-violet-700"
                    >
                      {topic.subject.color && (
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: topic.subject.color }}
                        />
                      )}
                      {topic.subject.name}
                    </Link>
                  )}
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

              <div className="flex-shrink-0 text-right text-xs text-slate-500">
                <p>
                  {topic.completedHours} / {topic.estimatedHours} hr
                </p>
                <p className="mt-0.5 text-slate-400">
                  Updated{' '}
                  {new Date(topic.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}