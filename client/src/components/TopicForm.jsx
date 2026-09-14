import { useState } from 'react';
import FormField from './FormField';
import SelectField from './SelectField';
import { TOPIC_STATUSES, TOPIC_PRIORITIES } from '../utils/constants';

export default function TopicForm({
  subjects = [],
  initial = {},
  fixedSubject,
  onSubmit,
  submitting = false,
}) {
  const [form, setForm] = useState({
    name: initial.name || '',
    description: initial.description || '',
    subject: fixedSubject || initial.subject?.id || '',
    status: initial.status || 'NOT_STARTED',
    priority: initial.priority || 'MEDIUM',
    estimatedHours: initial.estimatedHours ?? 0,
    completedHours: initial.completedHours ?? 0,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'estimatedHours' || name === 'completedHours'
          ? value === ''
            ? 0
            : Number(value)
          : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    const name = form.name.trim();
    if (!name) nextErrors.name = 'Topic name is required';
    else if (name.length > 80) nextErrors.name = 'Topic name cannot exceed 80 characters';
    if (!form.subject) nextErrors.subject = 'Please select a subject';
    if (form.estimatedHours < 0) nextErrors.estimatedHours = 'Cannot be negative';
    if (form.completedHours < 0) nextErrors.completedHours = 'Cannot be negative';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name,
      description: form.description.trim(),
      subject: form.subject,
      status: form.status,
      priority: form.priority,
      estimatedHours: form.estimatedHours,
      completedHours: form.completedHours,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {!fixedSubject && (
        <SelectField
          label="Subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          options={subjects.map((subject) => ({ value: subject.id, label: subject.name }))}
          error={errors.subject}
          placeholder="Select a subject"
        />
      )}

      <FormField
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="e.g. Quadratic equations"
      />

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-700"
        >
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
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={TOPIC_STATUSES}
          error={errors.status}
        />
        <SelectField
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
          options={TOPIC_PRIORITIES}
          error={errors.priority}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Estimated hours"
          name="estimatedHours"
          type="number"
          value={form.estimatedHours}
          onChange={handleChange}
          error={errors.estimatedHours}
          placeholder="0"
        />
        <FormField
          label="Completed hours"
          name="completedHours"
          type="number"
          value={form.completedHours}
          onChange={handleChange}
          error={errors.completedHours}
          placeholder="0"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save topic'}
        </button>
      </div>
    </form>
  );
}