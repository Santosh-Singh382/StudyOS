import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import Topic, { TOPIC_STATUSES, TOPIC_PRIORITIES } from '../models/Topic.js';
import { ApiError } from '../utils/ApiError.js';

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { name: 1 },
};

function serializeSubjectRef(subject) {
  if (!subject) return null;
  return {
    id: subject._id.toString(),
    name: subject.name,
    color: subject.color || null,
  };
}

export function serializeTopic(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    subject: serializeSubjectRef(doc.subject),
    name: doc.name,
    description: doc.description || '',
    status: doc.status,
    priority: doc.priority,
    estimatedHours: doc.estimatedHours,
    completedHours: doc.completedHours,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function assertValidId(id, label = 'topic') {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label} identifier.`);
  }
}

function isDuplicateKeyError(error) {
  return error && error.code === 11000;
}

function assertValidFilterValue(value, allowed, field) {
  if (allowed.includes(value)) return value;
  throw new ApiError(400, `Invalid ${field} filter.`);
}

async function ensureSubjectOwnedByUser(userId, subjectId) {
  const subject = await Subject.findOne({ _id: subjectId, user: userId });
  if (!subject) {
    throw new ApiError(404, 'Subject not found.');
  }
  return subject;
}

export async function listTopics(
  userId,
  { subject, status, priority, sort = 'name' } = {}
) {
  const filter = { user: userId };

  if (subject !== undefined && subject !== null && subject !== '') {
    if (!mongoose.isValidObjectId(subject)) {
      throw new ApiError(400, 'Invalid subject identifier.');
    }
    filter.subject = subject;
  }

  if (status) filter.status = assertValidFilterValue(status, TOPIC_STATUSES, 'status');
  if (priority) filter.priority = assertValidFilterValue(priority, TOPIC_PRIORITIES, 'priority');

  const docs = await Topic.find(filter)
    .sort(SORT_OPTIONS[sort] ?? SORT_OPTIONS.name)
    .populate('subject', 'name color');

  return docs.map(serializeTopic);
}

export async function getTopicById(userId, id) {
  assertValidId(id);
  const doc = await Topic.findOne({ _id: id, user: userId }).populate('subject', 'name color');
  if (!doc) {
    throw new ApiError(404, 'Topic not found.');
  }
  return serializeTopic(doc);
}

export async function createTopicForUser(userId, data) {
  if (!mongoose.isValidObjectId(data.subject)) {
    throw new ApiError(400, 'Invalid subject identifier.');
  }
  await ensureSubjectOwnedByUser(userId, data.subject);

  try {
    const doc = await Topic.create({ user: userId, ...data });
    const populated = await Topic.findById(doc._id).populate('subject', 'name color');
    return serializeTopic(populated);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'A topic with this name already exists in this subject.');
    }
    throw error;
  }
}

export async function updateTopicForUser(userId, id, data) {
  assertValidId(id);

  if (data.subject !== undefined) {
    if (!mongoose.isValidObjectId(data.subject)) {
      throw new ApiError(400, 'Invalid subject identifier.');
    }
    await ensureSubjectOwnedByUser(userId, data.subject);
  }

  const existing = await Topic.findOne({ _id: id, user: userId });
  if (!existing) {
    throw new ApiError(404, 'Topic not found.');
  }

  Object.assign(existing, data);
  try {
    await existing.save();
    const populated = await Topic.findById(existing._id).populate('subject', 'name color');
    return serializeTopic(populated);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'A topic with this name already exists in this subject.');
    }
    throw error;
  }
}

export async function deleteTopicForUser(userId, id) {
  assertValidId(id);
  const topic = await Topic.findOne({ _id: id, user: userId });
  if (!topic) {
    throw new ApiError(404, 'Topic not found.');
  }

  await topic.deleteOne();
  return { deleted: true };
}