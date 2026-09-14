import mongoose from 'mongoose';
import Task, { TASK_STATUSES, TASK_PRIORITIES } from '../models/Task.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import { ApiError } from '../utils/ApiError.js';

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  due: { dueDate: 1, createdAt: -1 },
};

const PRIORITY_WEIGHT = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };

function serializeSubjectRef(subject) {
  if (!subject) return null;
  return {
    id: subject._id.toString(),
    name: subject.name,
    color: subject.color || null,
  };
}

function serializeTopicRef(topic) {
  if (!topic) return null;
  return {
    id: topic._id.toString(),
    name: topic.name,
  };
}

export function serializeTask(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description || '',
    subject: serializeSubjectRef(doc.subject),
    topic: serializeTopicRef(doc.topic),
    priority: doc.priority,
    status: doc.status,
    dueDate: doc.dueDate ? doc.dueDate.toISOString() : null,
    estimatedMinutes: doc.estimatedMinutes,
    actualMinutes: doc.actualMinutes,
    recurring: Boolean(doc.recurring),
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function assertValidId(id, label = 'task') {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label} identifier.`);
  }
}

async function ensureSubjectOwnedByUser(userId, subjectId) {
  const subject = await Subject.findOne({ _id: subjectId, user: userId });
  if (!subject) {
    throw new ApiError(404, 'Subject not found.');
  }
  return subject;
}

async function ensureTopicOwnedByUser(userId, topicId) {
  const topic = await Topic.findOne({ _id: topicId, user: userId });
  if (!topic) {
    throw new ApiError(404, 'Topic not found.');
  }
  return topic;
}

// values.subject / values.topic are the incoming (possibly null) refs.
// provided describes which fields were explicitly part of the request.
async function resolveRefs(userId, values, provided = {}) {
  if (values.subject != null) {
    await ensureSubjectOwnedByUser(userId, values.subject);
  }

  if (values.topic != null) {
    const topic = await ensureTopicOwnedByUser(userId, values.topic);
    if (provided.subject && values.subject != null) {
      if (topic.subject.toString() !== values.subject.toString()) {
        throw new ApiError(400, 'Topic does not belong to the selected subject.');
      }
    } else {
      values.subject = topic.subject;
    }
  }

  return values;
}

function buildListFilter(userId, query = {}) {
  const filter = { user: userId };

  if (query.status) {
    if (!TASK_STATUSES.includes(query.status)) {
      throw new ApiError(400, 'Invalid status filter.');
    }
    filter.status = query.status;
  }
  if (query.priority) {
    if (!TASK_PRIORITIES.includes(query.priority)) {
      throw new ApiError(400, 'Invalid priority filter.');
    }
    filter.priority = query.priority;
  }
  if (query.subject) {
    if (!mongoose.isValidObjectId(query.subject)) {
      throw new ApiError(400, 'Invalid subject identifier.');
    }
    filter.subject = query.subject;
  }
  if (query.topic) {
    if (!mongoose.isValidObjectId(query.topic)) {
      throw new ApiError(400, 'Invalid topic identifier.');
    }
    filter.topic = query.topic;
  }

  const dueConditions = {};
  if (query.dueBefore) {
    const date = new Date(query.dueBefore);
    if (Number.isNaN(date.getTime())) throw new ApiError(400, 'Invalid dueBefore filter.');
    dueConditions.$lt = date;
  }
  if (query.dueAfter) {
    const date = new Date(query.dueAfter);
    if (Number.isNaN(date.getTime())) throw new ApiError(400, 'Invalid dueAfter filter.');
    dueConditions.$gt = date;
  }

  if (query.overdue === 'true') {
    dueConditions.$lt = new Date();
    filter.status = { $ne: 'COMPLETED' };
  }

  if (Object.keys(dueConditions).length > 0) {
    filter.dueDate = dueConditions;
  }

  return filter;
}

export async function createTask(userId, data) {
  await resolveRefs(userId, data, {
    subject: data.subject != null,
    topic: data.topic != null,
  });

  const doc = await Task.create({ user: userId, ...data });
  const populated = await Task.findById(doc._id)
    .populate('subject', 'name color')
    .populate('topic', 'name');
  return serializeTask(populated);
}

export async function getTasks(userId, query = {}) {
  const filter = buildListFilter(userId, query);
  const sort = SORT_OPTIONS[query.sort] ?? SORT_OPTIONS.newest;

  let docs = await Task.find(filter)
    .sort(sort)
    .populate('subject', 'name color')
    .populate('topic', 'name');

  if (query.sort === 'priority') {
    docs = docs
      .map((doc) => ({ doc, w: PRIORITY_WEIGHT[doc.priority] ?? 0 }))
      .sort((a, b) => b.w - a.w || b.doc.createdAt - a.doc.createdAt)
      .map(({ doc }) => doc);
  }

  return docs.map(serializeTask);
}

export async function getTaskById(userId, id) {
  assertValidId(id);
  const doc = await Task.findOne({ _id: id, user: userId })
    .populate('subject', 'name color')
    .populate('topic', 'name');
  if (!doc) {
    throw new ApiError(404, 'Task not found.');
  }
  return serializeTask(doc);
}

export async function updateTask(userId, id, data) {
  assertValidId(id);

  const existing = await Task.findOne({ _id: id, user: userId });
  if (!existing) {
    throw new ApiError(404, 'Task not found.');
  }

  const hasSubject = 'subject' in data;
  const hasTopic = 'topic' in data;
  if (hasSubject || hasTopic) {
    const refs = {
      subject: hasSubject ? data.subject : existing.subject,
      topic: hasTopic ? data.topic : existing.topic,
    };

    if (hasSubject && !hasTopic && refs.subject != null && refs.topic != null) {
      const topic = await ensureTopicOwnedByUser(userId, refs.topic);
      if (topic.subject.toString() !== refs.subject.toString()) {
        throw new ApiError(400, 'Topic does not belong to the selected subject.');
      }
    }

    await resolveRefs(userId, refs, {
      subject: hasSubject,
      topic: hasTopic,
    });

    data.subject = refs.subject;
    data.topic = refs.topic;
  }

  Object.assign(existing, data);
  await existing.save();

  const populated = await Task.findById(existing._id)
    .populate('subject', 'name color')
    .populate('topic', 'name');
  return serializeTask(populated);
}

export async function deleteTask(userId, id) {
  assertValidId(id);
  const task = await Task.findOne({ _id: id, user: userId });
  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  await task.deleteOne();
  return { deleted: true };
}

export async function completeTask(userId, id) {
  assertValidId(id);
  const task = await Task.findOne({ _id: id, user: userId });
  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  task.status = 'COMPLETED';
  task.completedAt = new Date();
  await task.save();

  const populated = await Task.findById(task._id)
    .populate('subject', 'name color')
    .populate('topic', 'name');
  return serializeTask(populated);
}

export async function uncompleteTask(userId, id) {
  assertValidId(id);
  const task = await Task.findOne({ _id: id, user: userId });
  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  task.status = task.status === 'COMPLETED' ? 'TODO' : task.status;
  task.completedAt = null;
  await task.save();

  const populated = await Task.findById(task._id)
    .populate('subject', 'name color')
    .populate('topic', 'name');
  return serializeTask(populated);
}