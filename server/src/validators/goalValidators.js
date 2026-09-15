import mongoose from 'mongoose';
import { GOAL_STATUSES, GOAL_TYPES, GOAL_PRIORITIES } from '../models/Goal.js';

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;

export function validateGoalCreateInput(body = {}) {
  const errors = {};
  const values = {};

  validateTitle(body.title, errors, values);
  validateDescription(body.description, errors, values);
  validateType(body.type, errors, values);
  validateTargetDate(body.targetDate, errors, values);
  validateStatus(body.status, errors, values);
  validatePriority(body.priority, errors, values);
  validateRefList(body.relatedSubjects, 'relatedSubjects', errors, values);
  validateRef(body.relatedExam, 'relatedExam', errors, values);

  return { errors, values };
}

export function validateGoalUpdateInput(body = {}) {
  const errors = {};
  const values = {};

  if ('title' in body) validateTitle(body.title, errors, values);
  if ('description' in body) validateDescription(body.description, errors, values);
  if ('type' in body) validateType(body.type, errors, values);
  if ('targetDate' in body) validateTargetDate(body.targetDate, errors, values);
  if ('status' in body) validateStatus(body.status, errors, values);
  if ('priority' in body) validatePriority(body.priority, errors, values);
  if ('relatedSubjects' in body) validateRefList(body.relatedSubjects, 'relatedSubjects', errors, values);
  if ('relatedExam' in body) validateRef(body.relatedExam, 'relatedExam', errors, values);

  return { errors, values };
}

function validateTitle(value, errors, values) {
  const title = typeof value === 'string' ? value.trim() : value;
  if (title === undefined || title === '') {
    errors.title = 'Goal title is required';
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

function validateType(value, errors, values) {
  if (value === undefined || value === '') {
    values.type = 'SHORT_TERM';
    return;
  }
  if (!GOAL_TYPES.includes(value)) {
    errors.type = `Type must be one of: ${GOAL_TYPES.join(', ')}`;
    return;
  }
  values.type = value;
}

function validateTargetDate(value, errors, values) {
  if (value === undefined || value === null || value === '') {
    values.targetDate = null;
    return;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors.targetDate = 'Target date must be a valid date';
    return;
  }
  values.targetDate = date;
}

function validateStatus(value, errors, values) {
  if (value === undefined || value === '') {
    values.status = 'ACTIVE';
    return;
  }
  if (!GOAL_STATUSES.includes(value)) {
    errors.status = `Status must be one of: ${GOAL_STATUSES.join(', ')}`;
    return;
  }
  values.status = value;
}

function validatePriority(value, errors, values) {
  if (value === undefined || value === '') {
    values.priority = 'MEDIUM';
    return;
  }
  if (!GOAL_PRIORITIES.includes(value)) {
    errors.priority = `Priority must be one of: ${GOAL_PRIORITIES.join(', ')}`;
    return;
  }
  values.priority = value;
}

function validateRefList(value, field, errors, values) {
  if (value === undefined || value === null) {
    values[field] = [];
    return;
  }
  if (!Array.isArray(value)) {
    errors[field] = `${field} must be an array`;
    return;
  }
  const ids = [];
  for (const item of value) {
    if (!mongoose.isValidObjectId(item)) {
      errors[field] = `Invalid identifier in ${field}`;
      return;
    }
    ids.push(item);
  }
  values[field] = [...new Set(ids.map((id) => id.toString()))];
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