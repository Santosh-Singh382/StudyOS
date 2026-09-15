import mongoose from 'mongoose';
import StudySession, {
  STUDY_SESSION_MODES,
  STUDY_SESSION_STATUSES,
} from '../models/StudySession.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import Task from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';

const SUBJECT_REQUIRED_MODES = ['STUDY', 'POMODORO_FOCUS'];

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

function serializeTaskRef(task) {
  if (!task) return null;
  return {
    id: task._id.toString(),
    title: task.title,
  };
}

export function serializeStudySession(doc, now = Date.now()) {
  let durationSeconds = doc.durationSeconds || 0;
  let liveSeconds = 0;

  if (doc.status === 'RUNNING' && doc.activeStartedAt) {
    const ms = now - doc.activeStartedAt.getTime();
    liveSeconds = ms > 0 ? Math.floor(ms / 1000) : 0;
  }

  return {
    id: doc._id.toString(),
    subject: serializeSubjectRef(doc.subject),
    topic: serializeTopicRef(doc.topic),
    task: serializeTaskRef(doc.task),
    mode: doc.mode,
    status: doc.status,
    startedAt: doc.startedAt ? doc.startedAt.toISOString() : null,
    endedAt: doc.endedAt ? doc.endedAt.toISOString() : null,
    durationSeconds,
    liveSeconds,
    totalSeconds: durationSeconds + liveSeconds,
    pausedSeconds: doc.pausedSeconds || 0,
    notes: doc.notes || '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function getSessionDoc(userId, id, { populate = false } = {}) {
  let query = StudySession.findOne({ _id: id, user: userId });
  if (populate) {
    query = query.populate('subject', 'name color').populate('topic', 'name').populate('task', 'title');
  }
  const doc = await query;
  if (!doc) {
    throw new ApiError(404, 'Study session not found.');
  }
  return doc;
}

function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid study session identifier.');
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

async function ensureTaskOwnedByUser(userId, taskId) {
  const task = await Task.findOne({ _id: taskId, user: userId });
  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }
  return task;
}

// Resolve + verify refs. For STUDY / POMODORO_FOCUS a subject is required,
// so a topic-only request derives the subject from the topic (as Phases 3/4 do).
async function resolveRefs(userId, data) {
  const resolved = { ...data };

  if (resolved.subject != null) {
    await ensureSubjectOwnedByUser(userId, resolved.subject);
  }

  if (resolved.topic != null) {
    const topic = await ensureTopicOwnedByUser(userId, resolved.topic);
    if (resolved.subject != null) {
      if (topic.subject.toString() !== resolved.subject.toString()) {
        throw new ApiError(400, 'Topic does not belong to the selected subject.');
      }
    } else {
      resolved.subject = topic.subject;
    }
  }

  if (resolved.task != null) {
    await ensureTaskOwnedByUser(userId, resolved.task);
  }

  return resolved;
}

function closeActiveInterval(doc, now) {
  if (doc.status === 'RUNNING' && doc.activeStartedAt) {
    let end = now;
    if (now < doc.activeStartedAt.getTime()) {
      end = doc.activeStartedAt.getTime();
    }
    doc.activeIntervals.push({
      start: doc.activeStartedAt,
      end: new Date(end),
    });
    const ms = end - doc.activeStartedAt.getTime();
    if (ms > 0) {
      doc.durationSeconds = (doc.durationSeconds || 0) + Math.floor(ms / 1000);
    }
    doc.activeStartedAt = null;
  }
}

function closePausedInterval(doc, now) {
  if (doc.status === 'PAUSED' && doc.pausedAt) {
    const ms = now - doc.pausedAt.getTime();
    if (ms > 0) {
      doc.pausedSeconds = (doc.pausedSeconds || 0) + Math.floor(ms / 1000);
    }
    doc.pausedAt = null;
  }
}

export async function createStudySession(userId, input) {
  if (SUBJECT_REQUIRED_MODES.includes(input.mode) && input.subject == null) {
    throw new ApiError(400, 'A subject is required for this session mode.');
  }

  const resolved = await resolveRefs(userId, {
    subject: input.subject ?? null,
    topic: input.topic ?? null,
    task: input.task ?? null,
  });

  const now = new Date();
  const doc = await StudySession.create({
    user: userId,
    subject: resolved.subject,
    topic: resolved.topic,
    task: resolved.task,
    mode: input.mode,
    status: 'RUNNING',
    startedAt: now,
    activeStartedAt: now,
    notes: input.notes || '',
  });

  const created = await getSessionDoc(userId, doc._id, { populate: true });
  return serializeStudySession(created);
}

export async function getStudySessions(userId, query = {}) {
  const filter = { user: userId };

  if (query.status) {
    if (!STUDY_SESSION_STATUSES.includes(query.status)) {
      throw new ApiError(400, 'Invalid status filter.');
    }
    filter.status = query.status;
  }
  if (query.mode) {
    if (!STUDY_SESSION_MODES.includes(query.mode)) {
      throw new ApiError(400, 'Invalid mode filter.');
    }
    filter.mode = query.mode;
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

  const dateConditions = {};
  if (query.from) {
    const date = new Date(query.from);
    if (Number.isNaN(date.getTime())) throw new ApiError(400, 'Invalid from filter.');
    dateConditions.$gte = date;
  }
  if (query.to) {
    const date = new Date(query.to);
    if (Number.isNaN(date.getTime())) throw new ApiError(400, 'Invalid to filter.');
    dateConditions.$lte = date;
  }
  if (Object.keys(dateConditions).length > 0) {
    filter.startedAt = dateConditions;
  }

  let limit = Number(query.limit);
  if (!Number.isFinite(limit) || limit <= 0 || limit > 500) {
    limit = 100;
  }

  const docs = await StudySession.find(filter)
    .sort({ startedAt: -1 })
    .limit(limit)
    .populate('subject', 'name color')
    .populate('topic', 'name')
    .populate('task', 'title');

  return docs.map((doc) => serializeStudySession(doc));
}

export async function getStudySessionById(userId, id) {
  assertValidId(id);
  const doc = await getSessionDoc(userId, id, { populate: true });
  return serializeStudySession(doc);
}

export async function getTodayStudySessions(userId) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const docs = await StudySession.find({
    user: userId,
    startedAt: { $gte: startOfToday },
  })
    .sort({ startedAt: -1 })
    .populate('subject', 'name color')
    .populate('topic', 'name')
    .populate('task', 'title');

  const sessions = docs.map((doc) => serializeStudySession(doc));

  const studySessions = sessions.filter(
    (session) => session.mode === 'STUDY' || session.mode === 'POMODORO_FOCUS'
  );
  const completedStudyMinutes = studySessions
    .filter((session) => session.status === 'COMPLETED')
    .reduce((sum, session) => sum + session.durationSeconds, 0);

  return {
    date: startOfToday,
    sessions,
    summary: {
      studySeconds: Math.round(completedStudyMinutes),
      sessionCount: studySessions.filter((session) => session.status === 'COMPLETED').length,
      totalSessions: sessions.length,
    },
  };
}

export async function getWeeklyStudySessions(userId) {
  const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const docs = await StudySession.find({
    user: userId,
    startedAt: { $gte: startOfWeek },
  })
    .sort({ startedAt: -1 })
    .populate('subject', 'name color')
    .populate('topic', 'name')
    .populate('task', 'title');

  const sessions = docs.map((doc) => serializeStudySession(doc));

  const completedStudySeconds = sessions
    .filter(
      (session) =>
        session.status === 'COMPLETED' &&
        (session.mode === 'STUDY' || session.mode === 'POMODORO_FOCUS')
    )
    .reduce((sum, session) => sum + session.durationSeconds, 0);

  return {
    startDate: startOfWeek,
    sessions,
    summary: {
      studySeconds: Math.round(completedStudySeconds),
      completedSessions: sessions.filter(
        (session) =>
          session.status === 'COMPLETED' &&
          (session.mode === 'STUDY' || session.mode === 'POMODORO_FOCUS')
      ).length,
    },
  };
}

export async function pauseStudySession(userId, id) {
  assertValidId(id);
  const doc = await getSessionDoc(userId, id);

  if (doc.status === 'COMPLETED') {
    throw new ApiError(409, 'Cannot pause a completed session.');
  }
  if (doc.status === 'CANCELLED') {
    throw new ApiError(409, 'Cannot pause a cancelled session.');
  }
  if (doc.status !== 'RUNNING') {
    throw new ApiError(409, 'Session is not running.');
  }

  const now = new Date();
  closeActiveInterval(doc, now);
  doc.pausedAt = now;
  doc.status = 'PAUSED';
  await doc.save();

  const updated = await getSessionDoc(userId, doc._id, { populate: true });
  return serializeStudySession(updated);
}

export async function resumeStudySession(userId, id) {
  assertValidId(id);
  const doc = await getSessionDoc(userId, id);

  if (doc.status === 'COMPLETED') {
    throw new ApiError(409, 'Cannot resume a completed session.');
  }
  if (doc.status === 'CANCELLED') {
    throw new ApiError(409, 'Cannot resume a cancelled session.');
  }
  if (doc.status !== 'PAUSED') {
    throw new ApiError(409, 'Session is not paused.');
  }

  const now = new Date();
  closePausedInterval(doc, now);
  doc.activeStartedAt = now;
  doc.status = 'RUNNING';
  await doc.save();

  const updated = await getSessionDoc(userId, doc._id, { populate: true });
  return serializeStudySession(updated);
}

export async function completeStudySession(userId, id) {
  assertValidId(id);
  const doc = await getSessionDoc(userId, id);

  if (doc.status === 'COMPLETED') {
    throw new ApiError(409, 'Session is already completed.');
  }
  if (doc.status === 'CANCELLED') {
    throw new ApiError(409, 'Cannot complete a cancelled session.');
  }

  const now = new Date();
  if (doc.status === 'RUNNING') {
    closeActiveInterval(doc, now);
  } else if (doc.status === 'PAUSED') {
    closePausedInterval(doc, now);
  }
  doc.endedAt = now;
  doc.status = 'COMPLETED';
  await doc.save();

  const updated = await getSessionDoc(userId, doc._id, { populate: true });
  return serializeStudySession(updated);
}

export async function cancelStudySession(userId, id) {
  assertValidId(id);
  const doc = await getSessionDoc(userId, id);

  if (doc.status === 'COMPLETED') {
    throw new ApiError(409, 'Cannot cancel a completed session.');
  }
  if (doc.status === 'CANCELLED') {
    throw new ApiError(409, 'Session is already cancelled.');
  }

  const now = new Date();
  if (doc.status === 'RUNNING') {
    closeActiveInterval(doc, now);
  } else if (doc.status === 'PAUSED') {
    closePausedInterval(doc, now);
  }
  doc.endedAt = now;
  doc.status = 'CANCELLED';
  await doc.save();

  const updated = await getSessionDoc(userId, doc._id, { populate: true });
  return serializeStudySession(updated);
}