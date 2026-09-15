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
  userA: null,
  userB: null,
  subjectA: null,
  subjectA2: null,
  topicA: null,
  topicA2: null,
  taskA: null,
  subjectB: null,
  topicB: null,
  taskB: null,
  sessionA: null,
  cancelSess: null,
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

async function main() {
  console.log('=== Phase 5 Backend Tests: Study Sessions ===');

  await mongoose.connect(env.mongoUri);

  console.log('\n[Auth guards]');
  const guarded = [
    ['GET', '/study-sessions'],
    ['GET', '/study-sessions/today'],
    ['GET', '/study-sessions/weekly'],
    ['POST', '/study-sessions'],
    ['GET', '/study-sessions/507f1f77bcf86cd799439011'],
    ['PATCH', '/study-sessions/507f1f77bcf86cd799439011/pause'],
    ['PATCH', '/study-sessions/507f1f77bcf86cd799439011/resume'],
    ['PATCH', '/study-sessions/507f1f77bcf86cd799439011/complete'],
    ['PATCH', '/study-sessions/507f1f77bcf86cd799439011/cancel'],
  ];
  for (const [method, path] of guarded) {
    const r = await req(method, path, { body: {} });
    check(`${method} ${path} without token → 401`, r.status === 401);
  }

  const userA = await registerFresh('sa');
  const userB = await registerFresh('sb');
  ids.userA = userA.user.id;
  ids.userB = userB.user.id;

  console.log('\n[Setup refs for A]');
  let r = await req('POST', '/subjects', { token: userA.token, body: { name: 'Math-S5', color: '#7c3aed' } });
  ids.subjectA = r.data.subject.id;
  r = await req('POST', '/subjects', { token: userA.token, body: { name: 'Phys-S5', color: '#0ea5e9' } });
  ids.subjectA2 = r.data.subject.id;
  r = await req('POST', '/topics', { token: userA.token, body: { subject: ids.subjectA, name: 'Algebra-S5' } });
  ids.topicA = r.data.topic.id;
  r = await req('POST', '/topics', { token: userA.token, body: { subject: ids.subjectA2, name: 'Mech-S5' } });
  ids.topicA2 = r.data.topic.id;
  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Solve S5 problems' } });
  ids.taskA = r.data.task.id;

  console.log('\n[Setup refs for B]');
  r = await req('POST', '/subjects', { token: userB.token, body: { name: 'Bio-S5' } });
  ids.subjectB = r.data.subject.id;
  r = await req('POST', '/topics', { token: userB.token, body: { subject: ids.subjectB, name: 'Cells-S5' } });
  ids.topicB = r.data.topic.id;
  r = await req('POST', '/tasks', { token: userB.token, body: { title: 'B task S5' } });
  ids.taskB = r.data.task.id;

  console.log('\n[Validation]');
  r = await req('POST', '/study-sessions', { token: userA.token, body: { mode: 'PROCRASTINATING', subject: ids.subjectA } });
  check('Invalid mode → 400', r.status === 400 && r.data.errors?.mode);

  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: 'not-objectid' } });
  check('Malformed subject ID → 400', r.status === 400 && r.data.errors?.subject);

  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: ids.subjectA, topic: 'not-objectid' } });
  check('Malformed topic ID → 400', r.status === 400 && r.data.errors?.topic);

  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: ids.subjectA, task: 'not-objectid' } });
  check('Malformed task ID → 400', r.status === 400 && r.data.errors?.task);

  r = await req('POST', '/study-sessions', {
    token: userA.token,
    body: { subject: ids.subjectA, notes: 'x'.repeat(501) },
  });
  check('Notes too long → 400', r.status === 400 && r.data.errors?.notes);

  r = await req('GET', '/study-sessions/not-an-id', { token: userA.token });
  check('Malformed :id on GET → 400', r.status === 400);
  r = await req('PATCH', '/study-sessions/not-an-id/pause', { token: userA.token });
  check('Malformed :id on PATCH → 400', r.status === 400);

  console.log('\n[Mode & ownership rules]');
  r = await req('POST', '/study-sessions', { token: userA.token, body: {} });
  check('STUDY without subject → 400', r.status === 400 && /subject is required/i.test(r.data.message));

  r = await req('POST', '/study-sessions', { token: userA.token, body: { mode: 'POMODORO_FOCUS' } });
  check('POMODORO_FOCUS without subject → 400', r.status === 400);

  r = await req('POST', '/study-sessions', { token: userA.token, body: { mode: 'POMODORO_SHORT_BREAK' } });
  check('POMODORO_SHORT_BREAK without subject → 201', r.status === 201 && r.data.session.status === 'RUNNING');

  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: ids.subjectB } });
  check('STUDY with B subject → 404 (subject not owned)', r.status === 404 && r.data.message === 'Subject not found.');

  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: ids.subjectA, topic: ids.topicB } });
  check('STUDY with B topic → 404 (topic not owned)', r.status === 404 && r.data.message === 'Topic not found.');

  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: ids.subjectA, topic: ids.topicA2 } });
  check('Topic belonging to different subject → 400', r.status === 400 && /does not belong/i.test(r.data.message));

  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: ids.subjectA, task: ids.taskB } });
  check('STUDY with B task → 404 (task not owned)', r.status === 404 && r.data.message === 'Task not found.');

  console.log('\n[Create — no duration injection]');
  r = await req('POST', '/study-sessions', {
    token: userA.token,
    body: { subject: ids.subjectA, durationSeconds: 999999, pausedSeconds: 12345 },
  });
  check('Create with injected durationSeconds → ignored (0)', r.status === 201 && r.data.session.durationSeconds === 0);

  r = await req('POST', '/study-sessions', {
    token: userA.token,
    body: { subject: ids.subjectA, topic: ids.topicA, task: ids.taskA, notes: 'Focus block' },
  });
  check('STUDY session created → 201', r.status === 201);
  check('Session starts RUNNING', r.status === 201 && r.data.session.status === 'RUNNING');
  check('Session serialized (id, no _id)', r.data.session.id && !r.data.session._id);
  check('Session subject populated', r.data.session.subject?.id === ids.subjectA && r.data.session.subject.color === '#7c3aed');
  check('Session topic populated', r.data.session.topic?.id === ids.topicA);
  check('Session task populated', r.data.session.task?.id === ids.taskA);
  check('Mode STUDY', r.data.session.mode === 'STUDY');
  check('Notes persisted', r.data.session.notes === 'Focus block');
  ids.sessionA = r.data.session.id;

  console.log('\n[Timestamp-based elapsing]');
  await sleep(1300);
  r = await req('GET', `/study-sessions/${ids.sessionA}`, { token: userA.token });
  check('liveSeconds grows while running', r.data.session.liveSeconds >= 1 && r.data.session.status === 'RUNNING');
  check('totalSeconds reflects live time', r.data.session.totalSeconds >= 1);

  console.log('\n[Pause freezes duration]');
  r = await req('PATCH', `/study-sessions/${ids.sessionA}/pause`, { token: userA.token });
  check('PATCH pause → PAUSED', r.status === 200 && r.data.session.status === 'PAUSED');
  const frozenDuration = r.data.session.durationSeconds;
  await sleep(1500);
  r = await req('GET', `/study-sessions/${ids.sessionA}`, { token: userA.token });
  check('Duration frozen while paused (no study time accrual)', r.data.session.status === 'PAUSED' && r.data.session.durationSeconds === frozenDuration);
  check('No liveSeconds while paused', r.data.session.liveSeconds === 0);

  r = await req('PATCH', `/study-sessions/${ids.sessionA}/pause`, { token: userA.token });
  check('Pause on PAUSED → 409', r.status === 409);

  console.log('\n[Resume continues accruing]');
  r = await req('PATCH', `/study-sessions/${ids.sessionA}/resume`, { token: userA.token });
  check('Resume → RUNNING', r.status === 200 && r.data.session.status === 'RUNNING');
  await sleep(1200);
  r = await req('GET', `/study-sessions/${ids.sessionA}`, { token: userA.token });
  check('Elapsed continues after resume', r.data.session.totalSeconds >= frozenDuration + 1);

  r = await req('PATCH', `/study-sessions/${ids.sessionA}/resume`, { token: userA.token });
  check('Resume on RUNNING → 409', r.status === 409);

  console.log('\n[Complete + immutable]');
  r = await req('PATCH', `/study-sessions/${ids.sessionA}/complete`, { token: userA.token });
  check('PATCH complete → COMPLETED', r.status === 200 && r.data.session.status === 'COMPLETED');
  check('endedAt set on complete', r.data.session.endedAt != null);
  check('durationSeconds reflects elapsed (>= pause point)', r.data.session.durationSeconds >= frozenDuration);
  check('liveSeconds zero on completed', r.data.session.liveSeconds === 0);

  r = await req('PATCH', `/study-sessions/${ids.sessionA}/pause`, { token: userA.token });
  check('Pause on COMPLETED → 409', r.status === 409);
  r = await req('PATCH', `/study-sessions/${ids.sessionA}/resume`, { token: userA.token });
  check('Resume on COMPLETED → 409', r.status === 409);
  r = await req('PATCH', `/study-sessions/${ids.sessionA}/complete`, { token: userA.token });
  check('Complete on COMPLETED → 409', r.status === 409);
  r = await req('PATCH', `/study-sessions/${ids.sessionA}/cancel`, { token: userA.token });
  check('Cancel on COMPLETED → 409', r.status === 409);

  console.log('\n[Cancel path]');
  r = await req('POST', '/study-sessions', { token: userA.token, body: { subject: ids.subjectA } });
  ids.cancelSess = r.data.session.id;
  await sleep(300);
  r = await req('PATCH', `/study-sessions/${ids.cancelSess}/cancel`, { token: userA.token });
  check('PATCH cancel → CANCELLED', r.status === 200 && r.data.session.status === 'CANCELLED');
  check('endedAt set on cancel', r.data.session.endedAt != null);

  r = await req('PATCH', `/study-sessions/${ids.cancelSess}/resume`, { token: userA.token });
  check('Resume on CANCELLED → 409', r.status === 409);
  r = await req('PATCH', `/study-sessions/${ids.cancelSess}/pause`, { token: userA.token });
  check('Pause on CANCELLED → 409', r.status === 409);
  r = await req('PATCH', `/study-sessions/${ids.cancelSess}/complete`, { token: userA.token });
  check('Complete on CANCELLED → 409', r.status === 409);
  r = await req('PATCH', `/study-sessions/${ids.cancelSess}/cancel`, { token: userA.token });
  check('Cancel on CANCELLED → 409', r.status === 409);

  console.log('\n[Cross-user security]');
  r = await req('GET', `/study-sessions/${ids.sessionA}`, { token: userB.token });
  check('GET A session with B token → 404', r.status === 404);
  r = await req('PATCH', `/study-sessions/${ids.sessionA}/pause`, { token: userB.token });
  check('Pause A session with B token → 404', r.status === 404);
  r = await req('PATCH', `/study-sessions/${ids.cancelSess}/complete`, { token: userB.token });
  check('Complete A cancelled with B token → 404', r.status === 404);

  console.log('\n[Today / Weekly scoping)');
  r = await req('GET', '/study-sessions/today', { token: userA.token });
  check('A today list contains sessions', r.status === 200 && r.data.sessions.length > 0);
  check('A today summary sessionCount counts completed study sessions', r.data.summary.sessionCount === 1);
  check('A today studySeconds > 0', r.data.summary.studySeconds >= 1);

  r = await req('GET', '/study-sessions/today', { token: userB.token });
  check('B today is empty (user scoped)', r.status === 200 && r.data.sessions.length === 0);

  r = await req('GET', '/study-sessions/weekly', { token: userA.token });
  check('A weekly sessions present', r.status === 200 && r.data.sessions.length > 0);
  check('A weekly summary studySeconds > 0', r.data.summary.studySeconds >= 1);

  r = await req('GET', '/study-sessions/weekly', { token: userB.token });
  check('B weekly is empty (user scoped)', r.status === 200 && r.data.sessions.length === 0);

  console.log('\n[Filters & list]');
  r = await req('GET', '/study-sessions', { token: userA.token });
  check('GET /study-sessions → 200 list', r.status === 200 && r.data.sessions.length > 0);

  r = await req('GET', '/study-sessions?mode=STUDY', { token: userA.token });
  check('Filter mode=STUDY', r.status === 200 && r.data.sessions.every((s) => s.mode === 'STUDY'));

  r = await req('GET', '/study-sessions?status=RUNNING', { token: userA.token });
  check('Filter status=RUNNING', r.status === 200 && r.data.sessions.every((s) => s.status === 'RUNNING'));

  r = await req('GET', `/study-sessions?subject=${ids.subjectA}`, { token: userA.token });
  check('Filter by subject', r.status === 200 && r.data.sessions.every((s) => s.subject?.id === ids.subjectA));

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const tomorrowEnd = new Date(todayStart.getTime() + 24*60*60*1000);
  r = await req('GET', `/study-sessions?from=${encodeURIComponent(todayStart.toISOString())}&to=${encodeURIComponent(tomorrowEnd.toISOString())}`, { token: userA.token });
  check('Filter by date range', r.status === 200 && r.data.sessions.length > 0);

  r = await req('GET', '/study-sessions?status=INVALID', { token: userA.token });
  check('Invalid status filter → 400', r.status === 400);
  r = await req('GET', '/study-sessions?mode=INVALID', { token: userA.token });
  check('Invalid mode filter → 400', r.status === 400);
  r = await req('GET', '/study-sessions?from=not-a-date', { token: userA.token });
  check('Invalid from filter → 400', r.status === 400);

  console.log('\n[Health regression]');
  r = await req('GET', '/health');
  check('GET /api/health → 200', r.status === 200 && r.data.success === true);

  console.log('\n[Cleanup]');
  try {
    await StudySession.deleteMany({ user: { $in: [ids.userA, ids.userB] } });
    await Task.deleteMany({ user: { $in: [ids.userA, ids.userB] } });
    await Topic.deleteMany({ user: { $in: [ids.userA, ids.userB] } });
    await Subject.deleteMany({ user: { $in: [ids.userA, ids.userB] } });
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