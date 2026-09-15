import mongoose from 'mongoose';
import { STUDY_SESSION_MODES } from '../models/StudySession.js';

const MAX_NOTES_LENGTH = 500;

export function validateStudySessionCreateInput(body = {}) {
  const errors = {};
  const values = {};

  validateMode(body.mode, errors, values);
  validateRef(body.subject, 'subject', errors, values);
  validateRef(body.topic, 'topic', errors, values);
  validateRef(body.task, 'task', errors, values);
  validateNotes(body.notes, errors, values);

  return { errors, values };
}

function validateMode(value, errors, values) {
  if (value === undefined || value === null || value === '') {
    values.mode = 'STUDY';
    return;
  }
  if (!STUDY_SESSION_MODES.includes(value)) {
    errors.mode = `Mode must be one of: ${STUDY_SESSION_MODES.join(', ')}`;
    return;
  }
  values.mode = value;
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

function validateNotes(value, errors, values) {
  if (value === undefined) return;
  const notes = typeof value === 'string' ? value.trim() : value;
  if (notes === '') {
    values.notes = '';
    return;
  }
  if (notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Notes cannot exceed ${MAX_NOTES_LENGTH} characters`;
    return;
  }
  values.notes = notes;
}