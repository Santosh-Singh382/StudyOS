import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import { ApiError } from '../utils/ApiError.js';

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { name: 1 },
};

export function serializeSubject(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || '',
    color: doc.color || null,
    targetHours: doc.targetHours,
    completedHours: doc.completedHours,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function assertValidId(id, label = 'subject') {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label} identifier.`);
  }
}

function isDuplicateKeyError(error) {
  return error && error.code === 11000;
}

export async function listSubjects(userId, sort = 'name') {
  const docs = await Subject.find({ user: userId }).sort(SORT_OPTIONS[sort] ?? SORT_OPTIONS.name);
  return docs.map(serializeSubject);
}

export async function getSubjectById(userId, id) {
  assertValidId(id);
  const doc = await Subject.findOne({ _id: id, user: userId });
  if (!doc) {
    throw new ApiError(404, 'Subject not found.');
  }
  return serializeSubject(doc);
}

export async function createSubjectForUser(userId, data) {
  try {
    const doc = await Subject.create({ user: userId, ...data });
    return serializeSubject(doc);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'A subject with this name already exists.');
    }
    throw error;
  }
}

export async function updateSubjectForUser(userId, id, data) {
  assertValidId(id);
  const existing = await Subject.findOne({ _id: id, user: userId });
  if (!existing) {
    throw new ApiError(404, 'Subject not found.');
  }

  Object.assign(existing, data);
  try {
    await existing.save();
    return serializeSubject(existing);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'A subject with this name already exists.');
    }
    throw error;
  }
}

export async function deleteSubjectForUser(userId, id) {
  assertValidId(id);
  const subject = await Subject.findOne({ _id: id, user: userId });
  if (!subject) {
    throw new ApiError(404, 'Subject not found.');
  }

  const result = await Topic.deleteMany({ subject: subject._id, user: userId });
  await subject.deleteOne();

  return { deleted: true, topicsDeleted: result.deletedCount ?? 0 };
}