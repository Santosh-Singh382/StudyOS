import mongoose from 'mongoose';
import Exam, { EXAM_STATUSES } from '../models/Exam.js';
import Subject from '../models/Subject.js';
import { listTopics } from './topicService.js';
import { ApiError } from '../utils/ApiError.js';

const FINISHED_TOPIC_STATUSES = ['COMPLETED', 'MASTERED'];

function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid exam identifier.');
  }
}

function startOfLocalDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calendarDaysBetween(from, to) {
  return Math.round((startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) / 86400000);
}

async function ensureSubjectOwnedByUser(userId, subjectId) {
  const subject = await Subject.findOne({ _id: subjectId, user: userId });
  if (!subject) {
    throw new ApiError(404, 'Subject not found.');
  }
  return subject;
}

async function ensureExamOwnedByUser(userId, id) {
  const doc = await Exam.findOne({ _id: id, user: userId });
  if (!doc) {
    throw new ApiError(404, 'Exam not found.');
  }
  return doc;
}

async function resolveSubjects(userId, subjectIds) {
  const resolved = [];
  for (const subjectId of subjectIds) {
    await ensureSubjectOwnedByUser(userId, subjectId);
    resolved.push(subjectId);
  }
  return [...new Set(resolved.map((id) => id.toString()))];
}

function computeExamProgress(topics, subjectIds) {
  if (!subjectIds || subjectIds.size === 0) return 0;
  const related = topics.filter(
    (topic) => topic.subject?.id && subjectIds.has(topic.subject.id.toString())
  );
  if (related.length === 0) return 0;
  const finished = related.filter((topic) => FINISHED_TOPIC_STATUSES.includes(topic.status)).length;
  return Math.round((finished / related.length) * 100);
}

export function serializeExam(doc, { topics = [], now = new Date() } = {}) {
  const subjectIds = new Set((doc.subjects || []).map((subject) => subject._id.toString()));
  const daysUntil = calendarDaysBetween(now, doc.examDate);

  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description || '',
    examDate: doc.examDate ? doc.examDate.toISOString() : null,
    examTime: doc.examTime || '',
    location: doc.location || '',
    status: doc.status,
    priority: doc.priority,
    subjects: (doc.subjects || []).map((subject) => ({
      id: subject._id.toString(),
      name: subject.name,
      color: subject.color || null,
    })),
    daysUntil,
    examProgress: computeExamProgress(topics, subjectIds),
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createExam(userId, data) {
  const subjects = await resolveSubjects(userId, data.subjects || []);
  const doc = await Exam.create({ user: userId, ...data, subjects });
  const populated = await doc.populate('subjects', 'name color');
  const topics = await listTopics(userId, {});
  return serializeExam(populated, { topics });
}

export async function getExams(userId, query = {}) {
  const filter = { user: userId };
  if (query.status) {
    if (!EXAM_STATUSES.includes(query.status)) {
      throw new ApiError(400, 'Invalid status filter.');
    }
    filter.status = query.status;
  }

  const docs = await Exam.find(filter)
    .sort({ examDate: 1 })
    .populate('subjects', 'name color');

  const topics = await listTopics(userId, {});
  return docs.map((doc) => serializeExam(doc, { topics }));
}

export async function getUpcomingExams(userId, limit = 3) {
  const todayStart = startOfLocalDay();
  const nextDay = new Date(todayStart);
  nextDay.setDate(nextDay.getDate() - 0);

  const docs = await Exam.find({
    user: userId,
    status: 'UPCOMING',
    examDate: { $gte: nextDay },
  })
    .sort({ examDate: 1 })
    .limit(limit)
    .populate('subjects', 'name color');

  const topics = await listTopics(userId, {});
  return docs.map((doc) => serializeExam(doc, { topics }));
}

export async function getExamById(userId, id) {
  assertValidId(id);
  const doc = await ensureExamOwnedByUser(userId, id);
  const populated = await doc.populate('subjects', 'name color');
  const topics = await listTopics(userId, {});
  return serializeExam(populated, { topics });
}

export async function updateExam(userId, id, data) {
  assertValidId(id);
  const existing = await ensureExamOwnedByUser(userId, id);

  if (data.subjects != null) {
    data.subjects = await resolveSubjects(userId, data.subjects);
  }

  const wasCompleted = existing.status === 'COMPLETED';
  const nowComplete = data.status === 'COMPLETED';
  if (nowComplete && !wasCompleted) {
    existing.completedAt = new Date();
  } else if (!nowComplete && wasCompleted) {
    existing.completedAt = null;
  }

  Object.assign(existing, data);
  await existing.save();

  const updated = await Exam.findById(existing._id).populate('subjects', 'name color');
  const topics = await listTopics(userId, {});
  return serializeExam(updated, { topics });
}

export async function deleteExam(userId, id) {
  assertValidId(id);
  const exam = await ensureExamOwnedByUser(userId, id);
  await exam.deleteOne();
  return { deleted: true };
}

export async function completeExam(userId, id) {
  assertValidId(id);
  const exam = await ensureExamOwnedByUser(userId, id);
  if (exam.status === 'COMPLETED') {
    throw new ApiError(409, 'Exam is already completed.');
  }
  if (exam.status === 'CANCELLED') {
    throw new ApiError(409, 'Cannot complete a cancelled exam.');
  }
  exam.status = 'COMPLETED';
  exam.completedAt = new Date();
  await exam.save();

  const updated = await Exam.findById(exam._id).populate('subjects', 'name color');
  const topics = await listTopics(userId, {});
  return serializeExam(updated, { topics });
}

export async function cancelExam(userId, id) {
  assertValidId(id);
  const exam = await ensureExamOwnedByUser(userId, id);
  if (exam.status === 'COMPLETED') {
    throw new ApiError(409, 'Cannot cancel a completed exam.');
  }
  if (exam.status === 'CANCELLED') {
    throw new ApiError(409, 'Exam is already cancelled.');
  }
  exam.status = 'CANCELLED';
  exam.completedAt = null;
  await exam.save();

  const updated = await Exam.findById(exam._id).populate('subjects', 'name color');
  const topics = await listTopics(userId, {});
  return serializeExam(updated, { topics });
}

export async function reopenExam(userId, id) {
  assertValidId(id);
  const exam = await ensureExamOwnedByUser(userId, id);
  if (exam.status === 'UPCOMING') {
    throw new ApiError(409, 'Exam is already upcoming.');
  }
  exam.status = 'UPCOMING';
  exam.completedAt = null;
  await exam.save();

  const updated = await Exam.findById(exam._id).populate('subjects', 'name color');
  const topics = await listTopics(userId, {});
  return serializeExam(updated, { topics });
}