import { useMemo, useState } from 'react';
import FormField from './FormField';
import SelectField from './SelectField';
import { TASK_PRIORITIES } from '../utils/constants';

function toDateInputValue(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function TaskForm({ subjects = [], topics = [], initial = {}, onSubmit, submitting = false }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    subject: initial.subject?.id || '',
    topic: initial.topic?.id || '',
    priority: initial.priority || 'MEDIUM',
    dueDate: toDateInputValue(initial.dueDate),
    estimatedMinutes: initial.estimatedMinutes ?? 0,
    actualMinutes: initial.actualMinutes ?? 0,
    recurring: Boolean(initial.recurring),
  });
  const [errors, setErrors] = useState({});

  const topicsForSubject = useMemo(() => {
    if (!form.subject) return [];
    return topics.filter((topic) => topic.subject?.id === form.subject);
  }, [topics, form.subject]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'estimatedMinutes' || name === 'actualMinutes'
            ? value === ''
              ? 0
              : Number(value)
            : value,
    }));
    if (name === 'subject') {
      setForm((prev) => ({ ...prev, topic: '' }));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    const title = form.title.trim();
    if (!title) nextErrors.title = 'Task title is required';
    else if (title.length > 120) nextErrors.title = 'Title cannot exceed 120 characters';
    if (form.estimatedMinutes < 0) nextErrors.estimatedMinutes = 'Cannot be negative';
    if (form.actualMinutes < 0) nextErrors.actualMinutes = 'Cannot be negative';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      title,
      description: form.description.trim(),
      subject: form.subject || null,
      topic: form.topic || null,
      priority: form.priority,
      dueDate: form.dueDate || null,
      estimatedMinutes: form.estimatedMinutes,
      actualMinutes: form.actualMinutes,
      recurring: form.recurring,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormField
        label="Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="e.g. Solve 30 Maths questions"
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          maxLength={500}
          placeholder="Optional notes"
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          options={subjects.map((subject) => ({ value: subject.id, label: subject.name }))}
          placeholder="No subject"
        />
        <SelectField
          label="Topic"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          options={topicsForSubject.map((topic) => ({ value: topic.id, label: topic.name }))}
          placeholder={form.subject ? 'Select a topic' : 'Pick a subject first'}
          disabled={!form.subject}
          error={errors.topic}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
          options={TASK_PRIORITIES}
          error={errors.priority}
        />
        <FormField
          label="Due date"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Estimated minutes"
          name="estimatedMinutes"
          type="number"
          value={form.estimatedMinutes}
          onChange={handleChange}
          error={errors.estimatedMinutes}
          placeholder="0"
        />
        <FormField
          label="Actual minutes"
          name="actualMinutes"
          type="number"
          value={form.actualMinutes}
          onChange={handleChange}
          error={errors.actualMinutes}
          placeholder="0"
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          name="recurring"
          checked={form.recurring}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-300"
        />
        Recurring task
      </label>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save task'}
        </button>
      </div>
    </form>
  );
}