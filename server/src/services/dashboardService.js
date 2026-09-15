import StudySession from '../models/StudySession.js';
import { listSubjects } from './subjectService.js';
import { listTopics } from './topicService.js';
import { getTasks } from './taskService.js';
import {
  getTodayStudySessions,
  getWeeklyStudySessions,
  getStudySessions,
} from './studySessionService.js';

const QUALIFYING_MODES = ['STUDY', 'POMODORO_FOCUS'];

// Statuses treated as "topic is finished" for progress purposes.
const FINISHED_TOPIC_STATUSES = ['COMPLETED', 'MASTERED'];

// Statuses that still need attention (not finished, not revision).
const ATTENTION_TOPIC_STATUSES = ['NOT_STARTED', 'LEARNING', 'PRACTICING', 'TESTED'];

const PRIORITY_WEIGHT = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };

// Absolute cap for the streak/all-time scan so the endpoint stays cheap
// even for heavy users. A cap of 10k qualifying sessions far exceeds any
// realistic streak span.
const STREAK_SCAN_LIMIT = 10000;

const MAX_TODAY_SESSIONS = 10;
const MAX_TASK_LIST = 8;
const MAX_ATTENTION_TOPICS = 5;
const MAX_RECENT_SESSIONS = 8;
const MAX_RECENT_TASKS = 5;

// Product-level daily study target used to derive "today's progress".
// Kept on the server so the dashboard renders real API data (target can be
// made per-user later without any client changes).
const DAILY_STUDY_TARGET_SECONDS = 3 * 3600 + 30 * 60; // 3h 30m

function startOfLocalDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isWithinDay(date, dayStart, dayEnd) {
  const time = new Date(date).getTime();
  return time >= dayStart && time < dayEnd;
}

async function computeStudyTotalsAndStreak(userId) {
  const docs = await StudySession.find({
    user: userId,
    status: 'COMPLETED',
    mode: { $in: QUALIFYING_MODES },
    durationSeconds: { $gt: 0 },
  })
    .select('startedAt durationSeconds')
    .sort({ startedAt: -1 })
    .limit(STREAK_SCAN_LIMIT);

  const activeDays = new Set();
  let totalStudySeconds = 0;
  for (const doc of docs) {
    activeDays.add(dayKey(doc.startedAt));
    totalStudySeconds += doc.durationSeconds;
  }

  // A day only counts as part of the current streak if it has qualifying
  // study time. If today has none yet, the streak is measured from
  // yesterday so it does not reset merely because today has not started.
  let streak = 0;
  const cursor = startOfLocalDay();
  if (!activeDays.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (activeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    currentStreak: streak,
    totalStudySeconds,
    completedSessions: docs.length,
  };
}

function computeTaskMetrics(tasks) {
  const todayStart = startOfLocalDay();
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const now = Date.now();

  let pendingCount = 0;
  let completedTodayCount = 0;
  let dueTodayCount = 0;
  let overdueCount = 0;
  const completedToday = [];
  const overdue = [];
  const highPriorityPending = [];
  const dueToday = [];

  for (const task of tasks) {
    const isCompleted = task.status === 'COMPLETED';

    if (isCompleted) {
      if (task.completedAt && isWithinDay(task.completedAt, todayStart, tomorrowStart)) {
        completedTodayCount += 1;
        completedToday.push(task);
      }
    } else {
      pendingCount += 1;
      if (task.priority === 'HIGH' || task.priority === 'URGENT') {
        highPriorityPending.push(task);
      }
    }

    if (task.dueDate) {
      const due = new Date(task.dueDate);
      if (isWithinDay(due, todayStart, tomorrowStart)) {
        dueTodayCount += 1;
        dueToday.push(task);
      }
      if (!isCompleted && due.getTime() < now) {
        overdueCount += 1;
        overdue.push(task);
      }
    }
  }

  const byPriority = (a, b) => (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0);
  const byDue = (a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime();

  completedToday.sort((a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime());
  overdue.sort((a, b) => byPriority(a, b) || byDue(a, b));
  highPriorityPending.sort(byPriority);
  dueToday.sort((a, b) => byPriority(a, b) || byDue(a, b));

  return {
    pendingCount,
    completedTodayCount,
    dueTodayCount,
    overdueCount,
    completedToday: completedToday.slice(0, MAX_TASK_LIST),
    overdue: overdue.slice(0, MAX_TASK_LIST),
    highPriorityPending: highPriorityPending.slice(0, MAX_TASK_LIST),
    dueToday: dueToday.slice(0, MAX_TASK_LIST),
  };
}

function computeSubjectProgress(subjects, topics) {
  const grouped = new Map();
  for (const subject of subjects) {
    grouped.set(subject.id, []);
  }
  for (const topic of topics) {
    const subjectId = topic.subject?.id;
    if (subjectId && grouped.has(subjectId)) {
      grouped.get(subjectId).push(topic);
    }
  }

  return [...grouped.entries()].map(([id, subjectTopics]) => {
    const subject = subjects.find((item) => item.id === id);
    const totalTopics = subjectTopics.length;
    const completedTopics = subjectTopics.filter((topic) =>
      FINISHED_TOPIC_STATUSES.includes(topic.status)
    ).length;
    return {
      id: subject.id,
      name: subject.name,
      color: subject.color || null,
      totalTopics,
      completedTopics,
      progress: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
    };
  });
}

function computeNeedingAttention(topics) {
  return topics
    .filter((topic) => ATTENTION_TOPIC_STATUSES.includes(topic.status))
    .sort((a, b) => (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0) || a.name.localeCompare(b.name))
    .slice(0, MAX_ATTENTION_TOPICS)
    .map((topic) => ({
      id: topic.id,
      name: topic.name,
      status: topic.status,
      priority: topic.priority,
      subject: topic.subject
        ? { id: topic.subject.id, name: topic.subject.name, color: topic.subject.color || null }
        : null,
    }));
}

function computeRecentCompletedTasks(tasks) {
  return tasks
    .filter((task) => task.status === 'COMPLETED' && task.completedAt)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, MAX_RECENT_TASKS);
}

export async function getDashboard(userId) {
  const [subjects, topics, tasks, today, weekly, recentSessions] = await Promise.all([
    listSubjects(userId),
    listTopics(userId, {}),
    getTasks(userId, {}),
    getTodayStudySessions(userId),
    getWeeklyStudySessions(userId),
    getStudySessions(userId, { limit: MAX_RECENT_SESSIONS }),
  ]);

  const { currentStreak, totalStudySeconds, completedSessions } = await computeStudyTotalsAndStreak(userId);

  const todayStudySeconds = Math.round(today.summary.studySeconds || 0);
  const taskMetrics = computeTaskMetrics(tasks);
  const subjectProgress = computeSubjectProgress(subjects, topics);

  const completedTopicCount = topics.filter((topic) =>
    FINISHED_TOPIC_STATUSES.includes(topic.status)
  ).length;

  const summary = {
    todayStudySeconds,
    todayStudyMinutes: Math.floor(todayStudySeconds / 60),
    todayCompletedTasks: taskMetrics.completedTodayCount,
    todayTotalTasks: taskMetrics.dueTodayCount,
    pendingTasks: taskMetrics.pendingCount,
    overdueTasks: taskMetrics.overdueCount,
    currentStreak,
    todayProgressPercent: Math.round(
      Math.min(
        100,
        (todayStudySeconds / DAILY_STUDY_TARGET_SECONDS) * 100
      )
    ),
  };

  const study = {
    targetSeconds: DAILY_STUDY_TARGET_SECONDS,
    todaySeconds: today.summary.studySeconds || 0,
    todayCompletedSessions: today.summary.sessionCount || 0,
    todayTotalSessions: today.summary.totalSessions || 0,
    todaySessions: today.sessions.slice(0, MAX_TODAY_SESSIONS),
    weeklySeconds: weekly.summary.studySeconds || 0,
    weeklyCompletedSessions: weekly.summary.completedSessions || 0,
    recentSessions,
  };

  return {
    summary,
    study,
    tasks: {
      total: tasks.length,
      completedToday: taskMetrics.completedToday,
      overdue: taskMetrics.overdue,
      highPriorityPending: taskMetrics.highPriorityPending,
      dueToday: taskMetrics.dueToday,
    },
    subjects: subjectProgress,
    topics: {
      total: topics.length,
      completed: completedTopicCount,
      needingAttention: computeNeedingAttention(topics),
    },
    recentActivity: {
      completedTasks: computeRecentCompletedTasks(tasks),
      studySessions: recentSessions.slice(0, MAX_RECENT_TASKS),
    },
    quickStats: {
      subjects: subjects.length,
      topics: topics.length,
      tasks: tasks.length,
      totalStudySeconds,
      completedSessions,
    },
  };
}