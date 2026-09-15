import { useState } from 'react';
import FormField from './FormField';
import { dateToIsoInput, isoToDateInput } from '../utils/planner';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES = ['UPCOMING', 'COMPLETED', 'CANCELLED'];

const selectClass =
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100';

export default function ExamForm({ initial = {}, subjects = [], onSubmit, submitting = false }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    examDate: isoToDateInput(initial.examDate),
    examTime: initial.examTime || '',
    location: initial.location || '',
    priority: initial.priority || 'MEDIUM',
    status: initial.status || 'UPCOMING',
    subjects: (initial.subjects || []).map((subject) => subject.id),
  });
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleSubject = (subjectId) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter((id) => id !== subjectId)
        : [...prev.subjects, subjectId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    const title = form.title.trim();
    if (!title) nextErrors.title = 'Exam title is required';
    else if (title.length > 120) nextErrors.title = 'Title cannot exceed 120 characters';
    if (!form.examDate) nextErrors.examDate = 'Exam date is required';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title,
      description: form.description.trim(),
      examDate: dateToIsoInput(form.examDate),
      examTime: form.examTime.trim(),
      location: form.location.trim(),
      priority: form.priority,
      status: form.status,
      subjects: form.subjects,
    };
    if (!payload.examTime) delete payload.examTime;
    if (!payload.location) delete payload.location;

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
        placeholder="e.g. Final Mathematics Exam"
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
          rows={2}
          maxLength={1000}
          placeholder="Optional — topics or notes covered"
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Exam date"
          name="examDate"
          type="date"
          value={form.examDate}
          onChange={(e) => handleChange('examDate', e.target.value)}
          error={errors.examDate}
        />
        <FormField
          label="Time (optional)"
          name="examTime"
          value={form.examTime}
          onChange={(e) => handleChange('examTime', e.target.value)}
          placeholder="e.g. 09:00"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Location (optional)"
          name="location"
          value={form.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="e.g. Hall A"
        />
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

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className={selectClass}
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700">Subjects</span>
        {subjects.length === 0 ? (
          <p className="mt-1 text-xs text-slate-400">
            No subjects yet — create one from the Subjects page.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {subjects.map((subject) => {
              const active = form.subjects.includes(subject.id);
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

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save exam'}
        </button>
      </div>
    </form>
  );
}