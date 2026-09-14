import mongoose from 'mongoose';
import { TASK_PRIORITIES, TASK_STATUSES } from '../models/Task.js';

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_MINUTES = 100000;

export function validateTaskCreateInput(body = {}) {
  const errors = {};
  const values = {};

  validateTitle(body.title, errors, values);
  validateDescription(body.description, errors, values);
  validatePriority(body.priority, errors, values, { optional: true });
  validateStatus(body.status, errors, values, { optional: true });
  validateDueDate(body.dueDate, errors, values);
  validateMinutes(body.estimatedMinutes, 'estimatedMinutes', errors, values);
  validateMinutes(body.actualMinutes, 'actualMinutes', errors, values);
  validateRecurring(body.recurring, errors, values);
  validateRef(body.subject, 'subject', errors, values);
  validateRef(body.topic, 'topic', errors, values);

  return { errors, values };
}

export function validateTaskUpdateInput(body = {}) {
  const errors = {};
  const values = {};

  if ('title' in body) validateTitle(body.title, errors, values);
  if ('description' in body) validateDescription(body.description, errors, values);
  if ('priority' in body) validatePriority(body.priority, errors, values, { optional: false });
  if ('status' in body) validateStatus(body.status, errors, values, { optional: false });
  if ('dueDate' in body) validateDueDate(body.dueDate, errors, values);
  if ('estimatedMinutes' in body) validateMinutes(body.estimatedMinutes, 'estimatedMinutes', errors, values);
  if ('actualMinutes' in body) validateMinutes(body.actualMinutes, 'actualMinutes', errors, values);
  if ('recurring' in body) validateRecurring(body.recurring, errors, values);
  if ('subject' in body) validateRef(body.subject, 'subject', errors, values);
  if ('topic' in body) validateRef(body.topic, 'topic', errors, values);

  return { errors, values };
}

function validateTitle(value, errors, values, { required = true } = {}) {
  const title = typeof value === 'string' ? value.trim() : value;
  if (title === undefined || title === '') {
    if (required) errors.title = 'Task title is required';
    else errors.title = 'Title cannot be empty';
    return;
  }
  if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title cannot exceed ${MAX_TITLE_LENGTH} characters`;
    return;
  }
  values.title = title;
}

function validateDescription(value, errors, values) {
  if (value === undefined) return;
  const description = typeof value === 'string' ? value.trim() : value;
  if (description === '') {
    values.description = '';
    return;
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
    return;
  }
  values.description = description;
}

function validatePriority(value, errors, values, { optional }) {
  if (value === undefined) {
    if (!optional) errors.priority = 'Priority is required';
    return;
  }
  if (!TASK_PRIORITIES.includes(value)) {
    errors.priority = `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`;
    return;
  }
  values.priority = value;
}

function validateStatus(value, errors, values, { optional }) {
  if (value === undefined) {
    if (!optional) errors.status = 'Status is required';
    return;
  }
  if (!TASK_STATUSES.includes(value)) {
    errors.status = `Status must be one of: ${TASK_STATUSES.join(', ')}`;
    return;
  }
  values.status = value;
}

function validateDueDate(value, errors, values) {
  if (value === undefined || value === null || value === '') {
    values.dueDate = null;
    return;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors.dueDate = 'Due date must be a valid date';
    return;
  }
  values.dueDate = date;
}

function validateMinutes(value, field, errors, values) {
  if (value === undefined || value === null || value === '') {
    values[field] = 0;
    return;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    errors[field] = 'Must be a valid number';
    return;
  }
  if (num < 0) {
    errors[field] = 'Cannot be negative';
    return;
  }
  if (num > MAX_MINUTES) {
    errors[field] = `Cannot exceed ${MAX_MINUTES} minutes`;
    return;
  }
  values[field] = Math.round(num);
}

function validateRecurring(value, errors, values) {
  if (value === undefined) return;
  if (typeof value !== 'boolean') {
    errors.recurring = 'Recurring must be true or false';
    return;
  }
  values.recurring = value;
}

function validateRef(value, field, errors, values) {
  if (value === undefined || value === null || value === '') {
    values[field] = null;
    return;
  }
  const id = typeof value === 'string' ? value.trim() : value;
  if (!mongoose.isValidObjectId(id)) {
    errors[field] = `Invalid ${field} identifier`;
    return;
  }
  values[field] = id;
}