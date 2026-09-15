import { useState } from 'react';
import FormField from './FormField';
import { dateToIsoInput, isoToDateInput } from '../utils/planner';

const GOAL_TYPES = [
  { value: 'SHORT_TERM', label: 'Short term', hint: 'Weeks' },
  { value: 'LONG_TERM', label: 'Long term', hint: 'Months' },
  { value: 'HABIT', label: 'Habit', hint: 'Repeating' },
  { value: 'SUBJECT', label: 'Subject', hint: 'Per subject' },
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const selectClass =
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100';
const inputClass =
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100';

export default function GoalForm({ initial = {}, subjects = [], exams = [], onSubmit, submitting = false }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    type: initial.type || 'SHORT_TERM',
    priority: initial.priority || 'MEDIUM',
    targetDate: isoToDateInput(initial.targetDate),
    relatedSubjects: (initial.relatedSubjects || []).map((subject) => subject.id),
    relatedExam: initial.relatedExam?.id || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleSubject = (subjectId) => {
    setForm((prev) => ({
      ...prev,
      relatedSubjects: prev.relatedSubjects.includes(subjectId)
        ? prev.relatedSubjects.filter((id) => id !== subjectId)
        : [...prev.relatedSubjects, subjectId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    const title = form.title.trim();
    if (!title) nextErrors.title = 'Goal title is required';
    else if (title.length > 120) nextErrors.title = 'Title cannot exceed 120 characters';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title,
      description: form.description.trim(),
      type: form.type,
      priority: form.priority,
      targetDate: dateToIsoInput(form.targetDate),
      relatedSubjects: form.relatedSubjects,
      relatedExam: form.relatedExam || null,
    };
    if (payload.targetDate == null) delete payload.targetDate;

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormField
        label="Title"
        name="title"
        value={form.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        placeholder="e.g. Score 90% in the finals"
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Optional details about this goal"
          className={`${inputClass} ${form.description.length > 0 ? '' : ''}`}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-700">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className={selectClass}
          >
            {GOAL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} — {type.hint}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={form.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className={selectClass}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority.charAt(0) + priority.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FormField
        label="Target date"
        name="targetDate"
        type="date"
        value={form.targetDate}
        onChange={(e) => handleChange('targetDate', e.target.value)}
      />

      <div>
        <span className="block text-sm font-medium text-slate-700">Related subjects</span>
        {subjects.length === 0 ? (
          <p className="mt-1 text-xs text-slate-400">
            No subjects yet — create one from the Subjects page.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {subjects.map((subject) => {
              const active = form.relatedSubjects.includes(subject.id);
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
                    active
                      ? 'border-violet-300 bg-violet-50 text-violet-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {subject.color && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: subject.color }}
                      aria-hidden="true"
                    />
                  )}
                  {subject.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="relatedExam" className="block text-sm font-medium text-slate-700">
          Related exam
        </label>
        <select
          id="relatedExam"
          name="relatedExam"
          value={form.relatedExam}
          onChange={(e) => handleChange('relatedExam', e.target.value)}
          className={selectClass}
        >
          <option value="">None</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save goal'}
        </button>
      </div>
    </form>
  );
}