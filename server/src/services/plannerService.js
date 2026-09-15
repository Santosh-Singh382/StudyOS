import Task from '../models/Task.js';
import StudySession from '../models/StudySession.js';
import Goal from '../models/Goal.js';
import Milestone from '../models/Milestone.js';
import Exam from '../models/Exam.js';

const QUALIFYING_MODES = ['STUDY', 'POMODORO_FOCUS'];

function parseDateParam(str) {
  if (!str) return startOfLocalDay();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str).trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function startOfLocalDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayStartEnd(date) {
  const start = startOfLocalDay(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function dateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayLabel(date, base = new Date()) {
  const diff = Math.round(
    (startOfLocalDay(date).getTime() - startOfLocalDay(base).getTime()) / 86400000
  );
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long' });
}

function calendarDaysBetween(from, to) {
  return Math.round((startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) / 86400000);
}

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

function serializeTask(doc) {
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
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
  };
}

function serializeSession(doc) {
  return {
    id: doc._id.toString(),
    mode: doc.mode,
    status: doc.status,
    startedAt: doc.startedAt ? doc.startedAt.toISOString() : null,
    endedAt: doc.endedAt ? doc.endedAt.toISOString() : null,
    durationSeconds: doc.durationSeconds || 0,
    subject: serializeSubjectRef(doc.subject),
    topic: serializeTopicRef(doc.topic),
  };
}

function serializeGoalRef(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    status: doc.status,
    targetDate: doc.targetDate ? doc.targetDate.toISOString() : null,
    priority: doc.priority,
  };
}

function serializeMilestoneRef(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    status: doc.status,
    targetDate: doc.targetDate ? doc.targetDate.toISOString() : null,
    goalId: doc.goal.toString(),
  };
}

function serializeExamRef(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    examDate: doc.examDate ? doc.examDate.toISOString() : null,
    examTime: doc.examTime || '',
    status: doc.status,
    priority: doc.priority,
    daysUntil: calendarDaysBetween(new Date(), doc.examDate),
  };
}

async function buildDayData(userId, dayDate) {
  const { start, end } = dayStartEnd(dayDate);

  const [tasks, sessions, goals, milestones, exams] = await Promise.all([
    Task.find({ user: userId, dueDate: { $gte: start, $lt: end } })
      .populate('subject', 'name color')
      .populate('topic', 'name'),
    StudySession.find({ user: userId, startedAt: { $gte: start, $lt: end } })
      .populate('subject', 'name color')
      .populate('topic', 'name'),
    Goal.find({ user: userId, status: 'ACTIVE', targetDate: { $gte: start, $lt: end } })
      .sort({ priority: -1, createdAt: -1 }),
    Milestone.find({ user: userId, status: 'PENDING', targetDate: { $gte: start, $lt: end } })
      .populate('goal', 'title status')
      .sort({ order: 1, createdAt: 1 }),
    Exam.find({ user: userId, status: 'UPCOMING', examDate: { $gte: start, $lt: end } })
      .populate('subjects', 'name color'),
  ]);

  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter((task) => task.status !== 'COMPLETED');
  const plannedMinutes = pendingTasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0);

  const studySessions = sessions.filter(
    (session) =>
      session.status === 'COMPLETED' &&
      (session.mode === 'STUDY' || session.mode === 'POMODORO_FOCUS')
  );
  const studySeconds = studySessions.reduce((sum, session) => sum + (session.durationSeconds || 0), 0);

  return {
    date: dateKey(dayDate),
    dayLabel: dayLabel(dayDate),
    isToday: dateKey(dayDate) === dateKey(new Date()),
    tasks: tasks.map(serializeTask),
    sessions: sessions.map(serializeSession),
    studySeconds,
    plannedMinutes,
    completedTasks,
    totalTasks: tasks.length,
    sessionsCount: sessions.length,
    exams: exams.map(serializeExamRef),
    goals: goals.map(serializeGoalRef),
    milestonesDue: milestones.map(serializeMilestoneRef),
  };
}

export async function getDayPlanner(userId, dateStr) {
  const dayDate = parseDateParam(dateStr);
  if (!dayDate) {
    return null;
  }
  return buildDayData(userId, dayDate);
}

export async function getWeekPlanner(userId, startDateStr) {
  const startDate = startDateStr ? parseDateParam(startDateStr) : null;
  if (startDateStr && !startDate) {
    return null;
  }

  const base = startDate || new Date();
  const { start: weekStart } = dayStartEnd(base);
  const dayOfWeek = weekStart.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
  const monday = new Date(weekStart);
  monday.setDate(monday.getDate() + mondayOffset);

  const { start, end } = dayStartEnd(monday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dayData = await buildDayData(userId, d);
    days.push(dayData);
  }

  const totalStudySeconds = days.reduce((sum, day) => sum + day.studySeconds, 0);
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + 7);

  return {
    startDate: dateKey(monday),
    endDate: dateKey(endDate),
    totalStudySeconds,
    days,
  };
}

export async function getPlannerOverview(userId) {
  const now = new Date();
  const todayStart = startOfLocalDay(now);
  const nextDay = new Date(todayStart);
  nextDay.setDate(nextDay.getDate() + 1);

  const [todayData, nextExam, activeGoalCount, nextMilestone, activeGoals] = await Promise.all([
    buildDayData(userId, now),
    Exam.findOne({
      user: userId,
      status: 'UPCOMING',
      examDate: { $gte: todayStart },
    })
      .sort({ examDate: 1 })
      .populate('subjects', 'name color'),
    Goal.countDocuments({ user: userId, status: 'ACTIVE' }),
    Milestone.findOne({
      user: userId,
      status: 'PENDING',
      targetDate: { $gte: todayStart },
    })
      .populate('goal', 'title status')
      .sort({ targetDate: 1, order: 1 }),
    Goal.find({ user: userId, status: 'ACTIVE' })
      .sort({ targetDate: 1, createdAt: -1 })
      .limit(5),
  ]);

  const nextGoal = activeGoals.length > 0 ? activeGoals[0] : null;

  return {
    today: {
      date: todayData.date,
      dayLabel: todayData.dayLabel,
      studySeconds: todayData.studySeconds,
      plannedMinutes: todayData.plannedMinutes,
      completedTasks: todayData.completedTasks,
      pendingTasks: todayData.totalTasks - todayData.completedTasks,
    },
    nextExam: nextExam ? serializeExamRef(nextExam) : null,
    upcomingExamCount: await Exam.countDocuments({ user: userId, status: 'UPCOMING', examDate: { $gte: todayStart } }),
    activeGoals: activeGoalCount,
    nextMilestone: nextMilestone
      ? { id: nextMilestone._id.toString(), title: nextMilestone.title, targetDate: nextMilestone.targetDate ? nextMilestone.targetDate.toISOString() : null, goalTitle: nextMilestone.goal?.title || null }
      : null,
    nextGoal: nextGoal ? serializeGoalRef(nextGoal) : null,
  };
}

export function parsePlannerDate(str) {
  return parseDateParam(str);
}