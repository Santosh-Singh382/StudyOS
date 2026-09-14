import mongoose from 'mongoose';
import { TOPIC_STATUSES, TOPIC_PRIORITIES } from '../models/Topic.js';

const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;

function parseHours(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function validateHours(value, field, errors, values) {
  if (value === undefined) return;
  if (Number.isNaN(value)) {
    errors[field] = 'Must be a valid number';
    return;
  }
  if (value < 0) {
    errors[field] = 'Cannot be negative';
    return;
  }
  values[field] = value;
}

function validateName(value, errors, values, { required }) {
  const name = typeof value === 'string' ? value.trim() : value;
  if (name === undefined || name === '') {
    if (required) {
      errors.name = 'Topic name is required';
      return;
    }
    errors.name = 'Name cannot be empty';
    return;
  }
  if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name cannot exceed ${MAX_NAME_LENGTH} characters`;
    return;
  }
  values.name = name;
}

function validateSubjectField(value, errors, values) {
  if (value === undefined) return;
  const subject = typeof value === 'string' ? value.trim() : value;
  if (subject === '') {
    errors.subject = 'Please select a subject';
    return;
  }
  if (!mongoose.isValidObjectId(subject)) {
    errors.subject = 'Invalid subject identifier';
    return;
  }
  values.subject = subject;
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

function validateStatus(value, errors, values, { required }) {
  if (value === undefined) {
    if (required) errors.status = 'Status is required';
    return;
  }
  if (!TOPIC_STATUSES.includes(value)) {
    errors.status = `Status must be one of: ${TOPIC_STATUSES.join(', ')}`;
    return;
  }
  values.status = value;
}

function validatePriority(value, errors, values, { required }) {
  if (value === undefined) {
    if (required) errors.priority = 'Priority is required';
    return;
  }
  if (!TOPIC_PRIORITIES.includes(value)) {
    errors.priority = `Priority must be one of: ${TOPIC_PRIORITIES.join(', ')}`;
    return;
  }
  values.priority = value;
}

export function validateTopicCreateInput(body = {}) {
  const errors = {};
  const values = {};

  validateSubjectField(body.subject, errors, values);
  validateName(body.name, errors, values, { required: true });
  validateDescription(body.description, errors, values);
  validateStatus(body.status, errors, values, { required: false });
  validatePriority(body.priority, errors, values, { required: false });
  validateHours(parseHours(body.estimatedHours), 'estimatedHours', errors, values);
  validateHours(parseHours(body.completedHours), 'completedHours', errors, values);

  return { errors, values };
}

export function validateTopicUpdateInput(body = {}) {
  const errors = {};
  const values = {};

  if ('subject' in body) validateSubjectField(body.subject, errors, values);
  if ('name' in body) validateName(body.name, errors, values, { required: true });
  if ('description' in body) validateDescription(body.description, errors, values);
  if ('status' in body) validateStatus(body.status, errors, values, { required: true });
  if ('priority' in body) validatePriority(body.priority, errors, values, { required: true });
  if ('estimatedHours' in body) validateHours(parseHours(body.estimatedHours), 'estimatedHours', errors, values);
  if ('completedHours' in body) validateHours(parseHours(body.completedHours), 'completedHours', errors, values);

  return { errors, values };
}