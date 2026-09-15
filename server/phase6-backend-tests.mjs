import mongoose from 'mongoose';
import { env } from './src/config/env.js';

import { default as StudySession } from './src/models/StudySession.js';
import { default as Task } from './src/models/Task.js';
import { default as User } from './src/models/User.js';
import { default as Subject } from './src/models/Subject.js';
import { default as Topic } from './src/models/Topic.js';

const BASE = 'http://localhost:5000/api';
const testUsers = [];
const ids = {
  userEmpty: null,
  userA: null,
  userB: null,
  userC: null,
  userD: null,
  subjectMath: null,
  subjectPhys: null,
  topicA1: null,
  topicA2: null,
  topicA3: null,
  taskDueToday: null,
  taskOverdue: null,
  taskUrgent: null,
};

let passed = 0;
let failed = 0;

function check(label, condition, extra = '') {
  if (condition) {
    passed++;
    console.log(`  PASS ${label}`);
  } else {
    failed++;
    console.log(`  FAIL ${label}${extra ? ` — ${extra}` : ''}`);
  }
}

async function req(method, path, { token, body } = {}) {
  const hasBody = body !== undefined && method !== 'GET' && method !== 'HEAD';
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  return { status: res.status, data };
}

function randomEmail(prefix) {
  return `${prefix}${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}

async function registerFresh(prefix) {
  const email = randomEmail(prefix);
  const { status, data } = await req('POST', '/auth/register', {
    body: { name: `${prefix}_User`, email, password: 'password123' },
  });
  if (status !== 201) throw new Error(`register failed: ${status} ${JSON.stringify(data)}`);
  testUsers.push(data.user.id);
  return { token: data.token, user: data.user, email };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function daysAgo(n, hour = 12) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function z(pad, value) {
  return String(value).padStart(pad, '0');
}

function isoLocal(d) {
  return `${d.getFullYear()}-${z(2, d.getMonth() + 1)}-${z(2, d.getDate())}T${z(2, d.getHours())}:${z(2, d.getMinutes())}:${z(2, d.getSeconds())}.000`;
}

async function expectDashboard(token, label) {
  const r = await req('GET', '/analytics/dashboard', { token });
  if (r.status !== 200) {
    check(`${label} → 200`, false, `got ${r.status} ${JSON.stringify(r.data)}`);
    return null;
  }
  check(`${label} → 200`, true);
  return r.data.dashboard;
}

async function main() {
  console.log('=== Phase 6 Backend Tests: Analytics Dashboard ===');

  await mongoose.connect(env.mongoUri);

  console.log('\n[Auth guard]');
  let r = await req('GET', '/analytics/dashboard');
  check('GET /analytics/dashboard without token → 401', r.status === 401);

  console.log('\n[Empty user — no data at all]');
  const emptyUser = await registerFresh('em');
  ids.userEmpty = emptyUser.user.id;
  const emptyDash = await expectDashboard(emptyUser.token, 'Empty dashboard');
  check('summary zeros', emptyDash.summary.todayStudySeconds === 0 && emptyDash.summary.todayStudyMinutes === 0);
  check('summary task/streak zeros', emptyDash.summary.pendingTasks === 0 && emptyDash.summary.overdueTasks === 0 && emptyDash.summary.currentStreak === 0);
  check('summary todayCompletedTasks 0', emptyDash.summary.todayCompletedTasks === 0);
  check('empty subjects array', Array.isArray(emptyDash.subjects) && emptyDash.subjects.length === 0);
  check('empty topics', emptyDash.topics.total === 0 && emptyDash.topics.completed === 0);
  check('empty tasks', emptyDash.tasks.total === 0 && emptyDash.tasks.completedToday.length === 0 && emptyDash.tasks.overdue.length === 0);
  check('empty study', emptyDash.study.todaySessions.length === 0 && emptyDash.study.recentSessions.length === 0);
  check('quickStats all zero', emptyDash.quickStats.subjects === 0 && emptyDash.quickStats.tasks === 0 && emptyDash.quickStats.totalStudySeconds === 0);
  check('predictable top-level object', Boolean(emptyDash.summary) && Boolean(emptyDash.study) && Boolean(emptyDash.tasks) && Boolean(emptyDash.recentActivity) && Boolean(emptyDash.quickStats));

  console.log('\n[User A — subjects, topics, tasks, sessions]');
  const userA = await registerFresh('dA');
  ids.userA = userA.user.id;

  r = await req('POST', '/subjects', { token: userA.token, body: { name: 'Math-A6', color: '#7c3aed' } });
  ids.subjectMath = r.data.subject.id;
  r = await req('POST', '/subjects', { token: userA.token, body: { name: 'Phys-A6', color: '#0ea5e9' } });
  ids.subjectPhys = r.data.subject.id;

  r = await req('POST', '/topics', { token: userA.token, body: { subject: ids.subjectMath, name: 'Algebra-A6' } });
  ids.topicA1 = r.data.topic.id;
  r = await req('PUT', `/topics/${ids.topicA1}`, { token: userA.token, body: { status: 'COMPLETED' } });
  check('Topic A1 set COMPLETED', r.status === 200 && r.data.topic.status === 'COMPLETED');

  r = await req('POST', '/topics', { token: userA.token, body: { subject: ids.subjectMath, name: 'Calculus-A6' } });
  ids.topicA2 = r.data.topic.id;
  r = await req('POST', '/topics', { token: userA.token, body: { subject: ids.subjectPhys, name: 'Mechanics-A6' } });
  ids.topicA3 = r.data.topic.id;
  r = await req('PUT', `/topics/${ids.topicA3}`, { token: userA.token, body: { status: 'COMPLETED' } });
  check('Topic A3 set COMPLETED', r.status === 200 && r.data.topic.status === 'COMPLETED');

  const todayLate = new Date();
  todayLate.setHours(23, 59, 59, 999);
  const yesterday = daysAgo(1, 10);

  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Math HW due today', priority: 'HIGH', dueDate: todayLate.toISOString() } });
  ids.taskDueToday = r.data.task.id;
  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Overdue reading', dueDate: yesterday.toISOString() } });
  ids.taskOverdue = r.data.task.id;
  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Submit urgent lab', priority: 'URGENT' } });
  ids.taskUrgent = r.data.task.id;
  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Quiz prep' } });
  const taskQuiz = r.data.task.id;
  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Review notes' } });
  const taskReview = r.data.task.id;
  r = await req('PATCH', `/tasks/${taskQuiz}/complete`, { token: userA.token });
  check('Complete Quiz prep', r.status === 200 && r.data.task.status === 'COMPLETED');
  r = await req('PATCH', `/tasks/${taskReview}/complete`, { token: userA.token });
  check('Complete Review notes', r.status === 200 && r.data.task.status === 'COMPLETED');

  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: ids.subjectMath, mode: 'STUDY' } });
  const s1 = r.data.session.id;
  await sleep(1300);
  r = await req('PATCH', `/study-sessions/${s1}/complete`, { token: userA.token });
  check('STUDY session completed', r.status === 200 && r.data.session.status === 'COMPLETED' && r.data.session.durationSeconds >= 1);

  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: ids.subjectMath, mode: 'POMODORO_FOCUS' } });
  const s2 = r.data.session.id;
  await sleep(1300);
  r = await req('PATCH', `/study-sessions/${s2}/complete`, { token: userA.token });
  check('POMODORO_FOCUS completed', r.status === 200 && r.data.session.status === 'COMPLETED' && r.data.session.durationSeconds >= 1);

  r = await req('POST', '/study-sessions', { token: userA.token, body: { mode: 'POMODORO_SHORT_BREAK' } });
  const s3 = r.data.session.id;
  await sleep(200);
  r = await req('PATCH', `/study-sessions/${s3}/complete`, { token: userA.token });
  check('Break completed (should not count toward study)', r.status === 200);

  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: ids.subjectMath } });
  const s4 = r.data.session.id;
  await sleep(150);
  r = await req('PATCH', `/study-sessions/${s4}/cancel`, { token: userA.token });
  check('Cancelled session (should not count)', r.status === 200 && r.data.session.status === 'CANCELLED');

  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: ids.subjectMath } });
  ids.runningSession = r.data.session.id;
  check('Running session created (should not count as completed)', r.status === 201 && r.data.session.status === 'RUNNING');

  console.log('\n[Dashboard values — A]');
  const dashA = await expectDashboard(userA.token, 'Dashboard A');
  check('todayStudySeconds >= 2 (two completed study sessions)', dashA.summary.todayStudySeconds >= 2, `got ${dashA.summary.todayStudySeconds}`);
  check('todayCompletedTasks === 2', dashA.summary.todayCompletedTasks === 2, `got ${dashA.summary.todayCompletedTasks}`);
  check('todayTotalTasks === 1 (due today)', dashA.summary.todayTotalTasks === 1, `got ${dashA.summary.todayTotalTasks}`);
  check('pendingTasks === 3', dashA.summary.pendingTasks === 3, `got ${dashA.summary.pendingTasks}`);
  check('overdueTasks === 1', dashA.summary.overdueTasks === 1, `got ${dashA.summary.overdueTasks}`);
  check('currentStreak === 1 (studied today)', dashA.summary.currentStreak === 1, `got ${dashA.summary.currentStreak}`);
  check('todayProgressPercent >= 0 and <= 100', dashA.summary.todayProgressPercent >= 0 && dashA.summary.todayProgressPercent <= 100, `got ${dashA.summary.todayProgressPercent}`);
  check('study.targetSeconds === 12600 (3h30m daily target)', dashA.study.targetSeconds === 12600, `got ${dashA.study.targetSeconds}`);

  check('study.todayCompletedSessions === 2', dashA.study.todayCompletedSessions === 2, `got ${dashA.study.todayCompletedSessions}`);
  check('study.todayTotalSessions === 5 (incl breaks/cancelled/running)', dashA.study.todayTotalSessions === 5, `got ${dashA.study.todayTotalSessions}`);
  check('study.weeklySeconds >= todaySeconds', dashA.study.weeklySeconds >= dashA.study.todaySeconds);
  check('study.recentSessions length >= 5', dashA.study.recentSessions.length >= 5);
  check('recentSessions excludes cancelled/break from qualifying? recent has study modes', dashA.study.recentSessions.some((s) => s.mode === 'STUDY' || s.mode === 'POMODORO_FOCUS'));

  check('tasks.total === 5', dashA.tasks.total === 5, `got ${dashA.tasks.total}`);
  check('tasks.overdue array has overdue reading', dashA.tasks.overdue.some((t) => t.title === 'Overdue reading'));
  check('tasks.completedToday length === 2', dashA.tasks.completedToday.length === 2, `got ${dashA.tasks.completedToday.length}`);
  check('tasks.highPriorityPending has urgent lab', dashA.tasks.highPriorityPending.some((t) => t.title === 'Submit urgent lab'));
  check('tasks.highPriorityPending has math HW', dashA.tasks.highPriorityPending.some((t) => t.title === 'Math HW due today'));
  check('tasks dueToday has math HW', dashA.tasks.dueToday.some((t) => t.id === ids.taskDueToday));

  const mathSubj = dashA.subjects.find((s) => s.name === 'Math-A6');
  const physSubj = dashA.subjects.find((s) => s.name === 'Phys-A6');
  check('Math-A6 present with color', mathSubj && mathSubj.color === '#7c3aed');
  check('Math-A6 progress 50% (1/2 topics)', mathSubj && mathSubj.totalTopics === 2 && mathSubj.completedTopics === 1 && mathSubj.progress === 50, JSON.stringify(mathSubj));
  check('Phys-A6 progress 100% (1/1 topics)', physSubj && physSubj.totalTopics === 1 && physSubj.completedTopics === 1 && physSubj.progress === 100, JSON.stringify(physSubj));

  check('topics.total === 3', dashA.topics.total === 3, `got ${dashA.topics.total}`);
  check('topics.completed === 2', dashA.topics.completed === 2, `got ${dashA.topics.completed}`);
  check('topics.needingAttention includes Calculus-A6', dashA.topics.needingAttention.some((t) => t.name === 'Calculus-A6'));

  check('recentActivity.completedTasks includes Quiz prep', dashA.recentActivity.completedTasks.some((t) => t.title === 'Quiz prep'));
  check('quickStats.subjects === 2', dashA.quickStats.subjects === 2, `got ${dashA.quickStats.subjects}`);
  check('quickStats.completedSessions === 2 (breaks/cancelled excluded)', dashA.quickStats.completedSessions === 2, `got ${dashA.quickStats.completedSessions}`);
  check('quickStats.totalStudySeconds >= 2', dashA.quickStats.totalStudySeconds >= 2, `got ${dashA.quickStats.totalStudySeconds}`);

  console.log('\n[User B — isolation]');
  const userB = await registerFresh('dB');
  ids.userB = userB.user.id;
  const dashB = await expectDashboard(userB.token, 'Dashboard B (fresh)');
  check('B subjects empty', dashB.subjects.length === 0);
  check('B tasks total 0', dashB.tasks.total === 0);
  check('B study today 0', dashB.study.todayTotalSessions === 0 && dashB.summary.todayStudySeconds === 0);
  check('B streak 0', dashB.summary.currentStreak === 0);
  check('B no leakage of A data', !dashB.tasks.overdue.some((t) => t.title.includes('Overdue')) && dashB.subjects.every((s) => s.name !== 'Math-A6'));

  console.log('\n[Streak — multi-day, gaps, breaks, zero-duration]');
  const userC = await registerFresh('dC');
  ids.userC = userC.user.id;
  // Two consecutive days ending yesterday → streak 2 even though today is empty.
  const c2 = daysAgo(2, 9);
  const c1 = daysAgo(1, 9);
  await StudySession.create({ user: ids.userC, mode: 'STUDY', status: 'COMPLETED', startedAt: c2, endedAt: new Date(c2.getTime() + 3600000), durationSeconds: 3600, activeIntervals: [{ start: c2, end: new Date(c2.getTime() + 3600000) }] });
  const cBreak = daysAgo(1, 11);
  await StudySession.create({ user: ids.userC, mode: 'POMODORO_SHORT_BREAK', status: 'COMPLETED', startedAt: cBreak, endedAt: new Date(cBreak.getTime() + 300000), durationSeconds: 300, activeIntervals: [{ start: cBreak, end: new Date(cBreak.getTime() + 300000) }] });
  const cFocus = daysAgo(1, 20);
  await StudySession.create({ user: ids.userC, mode: 'POMODORO_FOCUS', status: 'COMPLETED', startedAt: cFocus, endedAt: new Date(cFocus.getTime() + 1500000), durationSeconds: 1500, activeIntervals: [{ start: cFocus, end: new Date(cFocus.getTime() + 1500000) }] });
  const dashC = await expectDashboard(userC.token, 'Dashboard C (yesterday + 2 days ago)');
  check('C streak === 2 (from yesterday, today empty)', dashC.summary.currentStreak === 2, `got ${dashC.summary.currentStreak}`);
  check('C today study 0 (no sessions today)', dashC.summary.todayStudySeconds === 0);
  check('C break session did NOT add to study seconds', dashC.quickStats.totalStudySeconds === 3600 + 1500, `got ${dashC.quickStats.totalStudySeconds}`);
  check('C completedSessions counts only qualifying', dashC.quickStats.completedSessions === 2, `got ${dashC.quickStats.completedSessions}`);

  const userD = await registerFresh('dD');
  ids.userD = userD.user.id;
  const dGap = daysAgo(4, 8);
  await StudySession.create({ user: ids.userD, mode: 'STUDY', status: 'COMPLETED', startedAt: dGap, endedAt: new Date(dGap.getTime() + 600000), durationSeconds: 600, activeIntervals: [{ start: dGap, end: new Date(dGap.getTime() + 600000) }] });
  const dZero = daysAgo(1, 7);
  await StudySession.create({ user: ids.userD, mode: 'STUDY', status: 'COMPLETED', startedAt: dZero, endedAt: new Date(dZero.getTime() + 1000), durationSeconds: 0, activeIntervals: [{ start: dZero, end: new Date(dZero.getTime() + 1000) }] });
  const dashD = await expectDashboard(userD.token, 'Dashboard D (gap + zero-duration)');
  check('D streak === 0 (gap yesterday, no today)', dashD.summary.currentStreak === 0, `got ${dashD.summary.currentStreak}`);
  check('D zero-duration session not counted in totals', dashD.quickStats.totalStudySeconds === 600, `got ${dashD.quickStats.totalStudySeconds}`);
  check('D summary zeros for tasks', dashD.summary.pendingTasks === 0 && dashD.summary.overdueTasks === 0);

  console.log('\n[Response shape sanity]');
  check('dashboard.subjects serialized (no _id / mongo doc)', dashA.subjects.every((s) => s.id && !s._id));
  check('dashboard tasks serialized', dashA.tasks.overdue.every((t) => t.id && !t._id && typeof t.title === 'string'));
  check('sessions serialized with subject refs', dashA.study.recentSessions.every((s) => s.id && !s._id));

  console.log('\n[Health regression]');
  r = await req('GET', '/health');
  check('GET /api/health → 200', r.status === 200 && r.data.success === true);

  console.log('\n[Cleanup]');
  try {
    const allUsers = [ids.userEmpty, ids.userA, ids.userB, ids.userC, ids.userD];
    await StudySession.deleteMany({ user: { $in: allUsers } });
    await Task.deleteMany({ user: { $in: allUsers } });
    await Topic.deleteMany({ user: { $in: allUsers } });
    await Subject.deleteMany({ user: { $in: allUsers } });
    await User.deleteMany({ _id: { $in: testUsers } });
    console.log('  Cleaned up test data');
  } catch (e) {
    console.log('  Cleanup warning:', e.message);
  }

  await mongoose.disconnect();
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('FATAL', err);
  process.exit(1);
});