import mongoose from 'mongoose';
import { EXAM_STATUSES, EXAM_PRIORITIES } from '../models/Exam.js';

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_TIME_LENGTH = 20;
const MAX_LOCATION_LENGTH = 200;

export function validateExamCreateInput(body = {}) {
  const errors = {};
  const values = {};

  validateTitle(body.title, errors, values);
  validateDescription(body.description, errors, values);
  validateDate(body.examDate, errors, values);
  validateTime(body.examTime, errors, values);
  validateLocation(body.location, errors, values);
  validateStatus(body.status, errors, values);
  validatePriority(body.priority, errors, values);
  validateSubjectList(body.subjects, errors, values);

  return { errors, values };
}

export function validateExamUpdateInput(body = {}) {
  const errors = {};
  const values = {};

  if ('title' in body) validateTitle(body.title, errors, values);
  if ('description' in body) validateDescription(body.description, errors, values);
  if ('examDate' in body) validateDate(body.examDate, errors, values);
  if ('examTime' in body) validateTime(body.examTime, errors, values);
  if ('location' in body) validateLocation(body.location, errors, values);
  if ('status' in body) validateStatus(body.status, errors, values);
  if ('priority' in body) validatePriority(body.priority, errors, values);
  if ('subjects' in body) validateSubjectList(body.subjects, errors, values);

  return { errors, values };
}

function validateTitle(value, errors, values) {
  const title = typeof value === 'string' ? value.trim() : value;
  if (title === undefined || title === '') {
    errors.title = 'Exam title is required';
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
    errors.examDate = 'Exam date is required';
    return;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors.examDate = 'Exam date must be a valid date';
    return;
  }
  values.examDate = date;
}

function validateTime(value, errors, values) {
  if (value === undefined) return;
  const time = typeof value === 'string' ? value.trim() : value;
  if (time === '') {
    values.examTime = '';
    return;
  }
  if (time.length > MAX_TIME_LENGTH) {
    errors.examTime = `Time cannot exceed ${MAX_TIME_LENGTH} characters`;
    return;
  }
  values.examTime = time;
}

function validateLocation(value, errors, values) {
  if (value === undefined) return;
  const location = typeof value === 'string' ? value.trim() : value;
  if (location === '') {
    values.location = '';
    return;
  }
  if (location.length > MAX_LOCATION_LENGTH) {
    errors.location = `Location cannot exceed ${MAX_LOCATION_LENGTH} characters`;
    return;
  }
  values.location = location;
}

function validateStatus(value, errors, values) {
  if (value === undefined || value === '') {
    values.status = 'UPCOMING';
    return;
  }
  if (!EXAM_STATUSES.includes(value)) {
    errors.status = `Status must be one of: ${EXAM_STATUSES.join(', ')}`;
    return;
  }
  values.status = value;
}

function validatePriority(value, errors, values) {
  if (value === undefined || value === '') {
    values.priority = 'MEDIUM';
    return;
  }
  if (!EXAM_PRIORITIES.includes(value)) {
    errors.priority = `Priority must be one of: ${EXAM_PRIORITIES.join(', ')}`;
    return;
  }
  values.priority = value;
}

function validateSubjectList(value, errors, values) {
  if (value === undefined || value === null) {
    values.subjects = [];
    return;
  }
  if (!Array.isArray(value)) {
    errors.subjects = 'subjects must be an array';
    return;
  }
  const ids = [];
  for (const item of value) {
    if (!mongoose.isValidObjectId(item)) {
      errors.subjects = 'Invalid subject identifier in subjects';
      return;
    }
    ids.push(item);
  }
  values.subjects = [...new Set(ids.map((id) => id.toString()))];
}