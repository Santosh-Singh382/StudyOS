import mongoose from 'mongoose';
import Goal, { GOAL_STATUSES } from '../models/Goal.js';
import Milestone, { MILESTONE_STATUSES } from '../models/Milestone.js';
import Subject from '../models/Subject.js';
import Exam from '../models/Exam.js';
import { ApiError } from '../utils/ApiError.js';

function assertValidId(id, label = 'goal') {
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

async function ensureGoalOwnedByUser(userId, goalId) {
  const goal = await Goal.findOne({ _id: goalId, user: userId });
  if (!goal) {
    throw new ApiError(404, 'Goal not found.');
  }
  return goal;
}

async function resolveRefs(userId, data, provided = {}) {
  const relatedSubjects = [];
  if (Array.isArray(data.relatedSubjects)) {
    for (const subjectId of data.relatedSubjects) {
      await ensureSubjectOwnedByUser(userId, subjectId);
      relatedSubjects.push(subjectId);
    }
  } else if (provided.relatedSubjects) {
    throw new ApiError(400, 'relatedSubjects must be an array.');
  }
  data.relatedSubjects = relatedSubjects;

  if (data.relatedExam != null) {
    const exam = await Exam.findOne({ _id: data.relatedExam, user: userId });
    if (!exam) {
      throw new ApiError(404, 'Exam not found.');
    }
  }
  return data;
}

export function serializeMilestone(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description || '',
    targetDate: doc.targetDate ? doc.targetDate.toISOString() : null,
    status: doc.status,
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
    order: doc.order,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function serializeGoal(doc, milestones = []) {
  const total = milestones.length;
  const completed = milestones.filter((item) => item.status === 'COMPLETED').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description || '',
    type: doc.type,
    targetDate: doc.targetDate ? doc.targetDate.toISOString() : null,
    status: doc.status,
    priority: doc.priority,
    relatedSubjects: (doc.relatedSubjects || []).map((subject) => ({
      id: subject._id.toString(),
      name: subject.name,
      color: subject.color || null,
    })),
    relatedExam: doc.relatedExam
      ? {
          id: doc.relatedExam._id.toString(),
          title: doc.relatedExam.title,
          examDate: doc.relatedExam.examDate ? doc.relatedExam.examDate.toISOString() : null,
          status: doc.relatedExam.status,
        }
      : null,
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
    progress,
    milestones: milestones.map(serializeMilestone),
    milestoneStats: { total, completed },
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function loadGoal(userId, id) {
  assertValidId(id);
  return ensureGoalOwnedByUser(userId, id);
}

async function loadMilestones(userId, goalId) {
  return Milestone.find({ user: userId, goal: goalId }).sort({ order: 1, createdAt: 1 });
}

async function getMilestoneForGoal(userId, goalId, milestoneId, { validate = true } = {}) {
  if (validate) {
    assertValidId(goalId, 'goal');
    assertValidId(milestoneId, 'milestone');
  }
  const milestone = await Milestone.findOne({ _id: milestoneId, goal: goalId, user: userId });
  if (!milestone) {
    throw new ApiError(404, 'Milestone not found.');
  }
  return milestone;
}

export async function createGoal(userId, data) {
  await resolveRefs(userId, data, { relatedSubjects: data.relatedSubjects != null });

  const doc = await Goal.create({ user: userId, ...data });
  const goal = await Goal.findById(doc._id)
    .populate('relatedSubjects', 'name color')
    .populate('relatedExam', 'title examDate status');
  return serializeGoal(goal, []);
}

export async function getGoals(userId, query = {}) {
  const filter = { user: userId };
  if (query.status) {
    if (!GOAL_STATUSES.includes(query.status)) {
      throw new ApiError(400, 'Invalid status filter.');
    }
    filter.status = query.status;
  }

  const docs = await Goal.find(filter)
    .sort({ status: 1, targetDate: 1, createdAt: -1 })
    .populate('relatedSubjects', 'name color')
    .populate('relatedExam', 'title examDate status');

  const milestones = await Milestone.find({ user: userId, goal: { $in: docs.map((d) => d._id) } }).sort({
    order: 1,
    createdAt: 1,
  });
  const byGoal = new Map();
  for (const milestone of milestones) {
    const key = milestone.goal.toString();
    if (!byGoal.has(key)) byGoal.set(key, []);
    byGoal.get(key).push(milestone);
  }

  return docs.map((doc) => serializeGoal(doc, byGoal.get(doc._id.toString()) || []));
}

export async function getGoalById(userId, id) {
  assertValidId(id);
  const doc = await Goal.findOne({ _id: id, user: userId })
    .populate('relatedSubjects', 'name color')
    .populate('relatedExam', 'title examDate status');
  if (!doc) {
    throw new ApiError(404, 'Goal not found.');
  }
  const milestones = await loadMilestones(userId, doc._id);
  return serializeGoal(doc, milestones);
}

export async function updateGoal(userId, id, data) {
  const existing = await loadGoal(userId, id);
  await resolveRefs(userId, data, {
    relatedSubjects: data.relatedSubjects != null,
    relatedExam: data.relatedExam != null,
  });

  Object.assign(existing, data);
  await existing.save();

  const updated = await Goal.findById(existing._id)
    .populate('relatedSubjects', 'name color')
    .populate('relatedExam', 'title examDate status');
  const milestones = await loadMilestones(userId, updated._id);
  return serializeGoal(updated, milestones);
}

export async function deleteGoal(userId, id) {
  const goal = await loadGoal(userId, id);
  await Milestone.deleteMany({ user: userId, goal: goal._id });
  await goal.deleteOne();
  return { deleted: true };
}

export async function completeGoal(userId, id) {
  const goal = await loadGoal(userId, id);
  if (goal.status === 'COMPLETED') {
    throw new ApiError(409, 'Goal is already completed.');
  }
  if (goal.status === 'CANCELLED') {
    throw new ApiError(409, 'Cannot complete a cancelled goal.');
  }
  goal.status = 'COMPLETED';
  goal.completedAt = new Date();
  await goal.save();

  const updated = await Goal.findById(goal._id)
    .populate('relatedSubjects', 'name color')
    .populate('relatedExam', 'title examDate status');
  const milestones = await loadMilestones(userId, updated._id);
  return serializeGoal(updated, milestones);
}

export async function uncompleteGoal(userId, id) {
  const goal = await loadGoal(userId, id);
  if (goal.status !== 'COMPLETED') {
    throw new ApiError(409, 'Only a completed goal can be reopened.');
  }
  goal.status = 'ACTIVE';
  goal.completedAt = null;
  await goal.save();

  const updated = await Goal.findById(goal._id)
    .populate('relatedSubjects', 'name color')
    .populate('relatedExam', 'title examDate status');
  const milestones = await loadMilestones(userId, updated._id);
  return serializeGoal(updated, milestones);
}

export async function createMilestone(userId, goalId, data) {
  await ensureGoalOwnedByUser(userId, goalId);

  const count = await Milestone.countDocuments({ user: userId, goal: goalId });
  const doc = await Milestone.create({
    user: userId,
    goal: goalId,
    ...data,
    order: data.order != null ? data.order : count,
  });
  return serializeMilestone(doc);
}

export async function getMilestones(userId, goalId) {
  await ensureGoalOwnedByUser(userId, goalId);
  const milestones = await loadMilestones(userId, goalId);
  return milestones.map(serializeMilestone);
}

export async function updateMilestone(userId, id, data) {
  assertValidId(id, 'milestone');
  const milestone = await Milestone.findOne({ _id: id, user: userId });
  if (!milestone) {
    throw new ApiError(404, 'Milestone not found.');
  }

  const wasCompleted = milestone.status === 'COMPLETED';
  const nowComplete = data.status === 'COMPLETED';
  if (nowComplete && !wasCompleted) {
    milestone.completedAt = new Date();
  } else if (!nowComplete && wasCompleted) {
    milestone.completedAt = null;
  }

  Object.assign(milestone, data);
  await milestone.save();
  return serializeMilestone(milestone);
}

export async function deleteMilestone(userId, id) {
  assertValidId(id, 'milestone');
  const milestone = await Milestone.findOne({ _id: id, user: userId });
  if (!milestone) {
    throw new ApiError(404, 'Milestone not found.');
  }
  await milestone.deleteOne();
  return { deleted: true };
}

export async function completeMilestone(userId, id) {
  assertValidId(id, 'milestone');
  const milestone = await Milestone.findOne({ _id: id, user: userId });
  if (!milestone) {
    throw new ApiError(404, 'Milestone not found.');
  }
  if (milestone.status === 'COMPLETED') {
    throw new ApiError(409, 'Milestone is already completed.');
  }
  milestone.status = 'COMPLETED';
  milestone.completedAt = new Date();
  await milestone.save();
  return serializeMilestone(milestone);
}

export async function uncompleteMilestone(userId, id) {
  assertValidId(id, 'milestone');
  const milestone = await Milestone.findOne({ _id: id, user: userId });
  if (!milestone) {
    throw new ApiError(404, 'Milestone not found.');
  }
  if (milestone.status !== 'COMPLETED') {
    throw new ApiError(409, 'Only a completed milestone can be reopened.');
  }
  milestone.status = 'PENDING';
  milestone.completedAt = null;
  await milestone.save();
  return serializeMilestone(milestone);
}

export function milestoneStatuses() {
  return MILESTONE_STATUSES;
}