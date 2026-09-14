import { useState } from 'react';
import FormField from './FormField';
import { SUBJECT_COLORS } from '../utils/constants';

export default function SubjectForm({ initial = {}, onSubmit, submitting = false }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    description: initial.description || '',
    color: initial.color || null,
    targetHours: initial.targetHours ?? 0,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'targetHours' ? (value === '' ? 0 : Number(value)) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    const name = form.name.trim();
    if (!name) nextErrors.name = 'Subject name is required';
    else if (name.length > 80) nextErrors.name = 'Subject name cannot exceed 80 characters';
    if (form.targetHours < 0) nextErrors.targetHours = 'Cannot be negative';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name,
      description: form.description.trim(),
      color: form.color,
      targetHours: form.targetHours,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormField
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="e.g. Mathematics"
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
          rows={3}
          maxLength={500}
          placeholder="Optional notes about this subject"
          aria-invalid={errors.description ? true : undefined}
          className={`mt-1 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            errors.description
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-300 focus:border-violet-500 focus:ring-violet-100'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700">Color</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUBJECT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, color }))}
              aria-label={`Use color ${color}`}
              aria-pressed={form.color === color}
              className={`h-8 w-8 rounded-full transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
                form.color === color ? 'scale-110 ring-2 ring-slate-800 ring-offset-2' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <FormField
        label="Target hours"
        name="targetHours"
        type="number"
        value={form.targetHours}
        onChange={handleChange}
        error={errors.targetHours}
        placeholder="0"
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save subject'}
        </button>
      </div>
    </form>
  );
}