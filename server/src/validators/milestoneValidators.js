import { MILESTONE_STATUSES } from '../models/Milestone.js';

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_ORDER = 100000;

export function validateMilestoneCreateInput(body = {}) {
  const errors = {};
  const values = {};

  validateTitle(body.title, errors, values);
  validateDescription(body.description, errors, values);
  validateDate(body.targetDate, errors, values);
  validateStatus(body.status, errors, values);
  validateOrder(body.order, errors, values);

  return { errors, values };
}

export function validateMilestoneUpdateInput(body = {}) {
  const errors = {};
  const values = {};

  if ('title' in body) validateTitle(body.title, errors, values);
  if ('description' in body) validateDescription(body.description, errors, values);
  if ('targetDate' in body) validateDate(body.targetDate, errors, values);
  if ('status' in body) validateStatus(body.status, errors, values);
  if ('order' in body) validateOrder(body.order, errors, values);

  return { errors, values };
}

function validateTitle(value, errors, values) {
  const title = typeof value === 'string' ? value.trim() : value;
  if (title === undefined || title === '') {
    errors.title = 'Milestone title is required';
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

function validateDate(value, errors, values) {
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
    values.status = 'PENDING';
    return;
  }
  if (!MILESTONE_STATUSES.includes(value)) {
    errors.status = `Status must be one of: ${MILESTONE_STATUSES.join(', ')}`;
    return;
  }
  values.status = value;
}

function validateOrder(value, errors, values) {
  if (value === undefined || value === null || value === '') {
    return;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    errors.order = 'Order must be a non-negative number';
    return;
  }
  if (num > MAX_ORDER) {
    errors.order = `Order cannot exceed ${MAX_ORDER}`;
    return;
  }
  values.order = Math.round(num);
}