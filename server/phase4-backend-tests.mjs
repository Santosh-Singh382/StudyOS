import mongoose from 'mongoose';
import { env } from './src/config/env.js';

const BASE = 'http://localhost:5000/api';
const testUsers = [];
const testIds = { userA: null, userB: null, subjectA: null, subjectB: null, topicA: null, topicB: null };

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
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
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

async function main() {
  console.log('=== Phase 4 Backend Tests: Task Management ===');

  await mongoose.connect(env.mongoUri);

  console.log('\n[AUTH guards]');
  for (const ep of ['/tasks', '/tasks/507f1f77bcf86cd799439011']) {
    const r = await req('GET', ep);
    check(`GET ${ep} without token → 401`, r.status === 401);
  }
  const r401 = await req('POST', '/tasks', { body: { title: 'x' } });
  check('POST /tasks without token → 401', r401.status === 401);
  const r402 = await req('PUT', '/tasks/507f1f77bcf86cd799439011', { body: { title: 'x' } });
  check('PUT /tasks/:id without token → 401', r402.status === 401);
  const r403 = await req('DELETE', '/tasks/507f1f77bcf86cd799439011');
  check('DELETE /tasks/:id without token → 401', r403.status === 401);
  const r404 = await req('PATCH', '/tasks/507f1f77bcf86cd799439011/complete');
  check('PATCH /tasks/:id/complete without token → 401', r404.status === 401);
  const r405 = await req('PATCH', '/tasks/507f1f77bcf86cd799439011/uncomplete');
  check('PATCH /tasks/:id/uncomplete without token → 401', r405.status === 401);

  const userA = await registerFresh('ua');
  const userB = await registerFresh('ub');
  testIds.userA = userA.user.id;
  testIds.userB = userB.user.id;

  console.log('\n[Create subjects & topics for task refs]');
  let r = await req('POST', '/subjects', { token: userA.token, body: { name: 'Math-TaskTest', color: '#7c3aed' } });
  check('Subject A created', r.status === 201);
  testIds.subjectA = r.data.subject.id;
  r = await req('POST', '/subjects', { token: userA.token, body: { name: 'Phys-TaskTest', color: '#0ea5e9' } });
  check('Subject B created', r.status === 201);
  testIds.subjectB = r.data.subject.id;
  r = await req('POST', '/topics', { token: userA.token, body: { subject: testIds.subjectA, name: 'Algebra-TaskTest' } });
  check('Topic A created', r.status === 201);
  testIds.topicA = r.data.topic.id;
  r = await req('POST', '/topics', { token: userA.token, body: { subject: testIds.subjectB, name: 'Mech-TaskTest' } });
  check('Topic B created', r.status === 201);
  testIds.topicB = r.data.topic.id;

  let task1Id, task2Id, task3Id;

  console.log('\n[Validation]');
  r = await req('POST', '/tasks', { token: userA.token, body: {} });
  check('Missing title → 400', r.status === 400 && r.data.errors?.title);

  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Bad Priority', priority: 'MEGA' } });
  check('Invalid priority → 400', r.status === 400 && r.data.errors?.priority);

  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Bad Status', status: 'CLOSED' } });
  check('Invalid status → 400', r.status === 400 && r.data.errors?.status);

  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Bad Subject', subject: 'not-objectid' } });
  check('Malformed subject ID → 400', r.status === 400 && r.data.errors?.subject);

  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Bad Topic', topic: 'not-objectid' } });
  check('Malformed topic ID → 400', r.status === 400 && r.data.errors?.topic);

  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Negative minutes', estimatedMinutes: -5 } });
  check('Negative estimatedMinutes → 400', r.status === 400 && r.data.errors?.estimatedMinutes);

  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Bad Date', dueDate: 'not-a-date' } });
  check('Invalid dueDate → 400', r.status === 400 && r.data.errors?.dueDate);

  console.log('\n[Create tasks]');
  r = await req('POST', '/tasks', {
    token: userA.token,
    body: {
      title: 'Solve 30 Maths questions',
      description: 'Quadratic equations practice set',
      subject: testIds.subjectA,
      topic: testIds.topicA,
      priority: 'HIGH',
      estimatedMinutes: 45,
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      recurring: false,
    },
  });
  check('Task 1 created → 201', r.status === 201);
  check('Task 1 serialized', r.data.task?.id && !r.data.task?._id && r.data.task.title === 'Solve 30 Maths questions');
  check('Task 1 subject populated', r.data.task.subject?.id === testIds.subjectA && r.data.task.subject.color === '#7c3aed');
  check('Task 1 topic populated', r.data.task.topic?.id === testIds.topicA);
  task1Id = r.data.task.id;

  r = await req('POST', '/tasks', {
    token: userA.token,
    body: { title: 'Watch Chemistry lecture', priority: 'LOW', status: 'IN_PROGRESS', estimatedMinutes: 60, actualMinutes: 30 },
  });
  check('Task 2 created → 201', r.status === 201);
  task2Id = r.data.task.id;

  r = await req('POST', '/tasks', {
    token: userA.token,
    body: { title: 'Revise Biology', priority: 'URGENT', recurring: true },
  });
  check('Task 3 created → 201', r.status === 201);
  task3Id = r.data.task.id;

  console.log('\n[Subject & topic ownership]');
  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Using B user subj', subject: 'not-id' } });
  check('Malformed subject ref → 400', r.status === 400);

  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Using B subject', subject: testIds.userB } });
  check('B user ObjectId as subject → 404 (not owned)', r.status === 404 && r.data.message === 'Subject not found.');

  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'Topic mismatch', subject: testIds.subjectA, topic: testIds.topicB } });
  check('Topic belonging to different subject → 400', r.status === 400 && /does not belong/i.test(r.data.errors?.topic || r.data.message));

  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'No subj, topic only', topic: testIds.topicA } });
  check('Topic only (no subject) → auto-derives subject → 201', r.status === 201 && r.data.task.subject?.id === testIds.subjectA);

  console.log('\n[List & get]');
  r = await req('GET', '/tasks', { token: userA.token });
  check('GET /tasks → 200, list length >= 4', r.status === 200 && r.data.tasks.length >= 4);

  r = await req('GET', `/tasks/${task1Id}`, { token: userA.token });
  check('GET /tasks/:id → 200', r.status === 200 && r.data.task.id === task1Id);

  console.log('\n[Update]');
  r = await req('PUT', `/tasks/${task1Id}`, {
    token: userA.token,
    body: { title: 'Solve 30 Maths questions - updated', actualMinutes: 10 },
  });
  check('PUT task → 200', r.status === 200 && r.data.task.title === 'Solve 30 Maths questions - updated' && r.data.task.actualMinutes === 10);

  r = await req('PUT', `/tasks/${task1Id}`, {
    token: userA.token,
    body: { subject: testIds.subjectB },
  });
  check('PUT task subject (without topic) → revalidate topic', r.status === 400 && /does not belong/i.test(r.data.message));

  console.log('\n[Complete / uncomplete]');
  r = await req('PATCH', `/tasks/${task1Id}/complete`, { token: userA.token });
  check('PATCH complete → COMPLETED + completedAt set', r.status === 200 && r.data.task.status === 'COMPLETED' && r.data.task.completedAt != null);

  const completedAt1 = r.data.task.completedAt;
  r = await req('PATCH', `/tasks/${task1Id}/complete`, { token: userA.token });
  check('Idempotent complete (keeps original completedAt or sets)', r.status === 200 && r.data.task.completedAt != null);

  r = await req('PATCH', `/tasks/${task1Id}/uncomplete`, { token: userA.token });
  check('PATCH uncomplete → TODO + completedAt null', r.status === 200 && r.data.task.status === 'TODO' && r.data.task.completedAt === null);

  r = await req('PATCH', `/tasks/${task2Id}/complete`, { token: userA.token });
  check('Complete task 2 → COMPLETED', r.status === 200 && r.data.task.status === 'COMPLETED');

  console.log('\n[Filters]');
  r = await req('GET', '/tasks?status=COMPLETED', { token: userA.token });
  check('Filter status=COMPLETED → only completed tasks', r.status === 200 && r.data.tasks.length >= 1 && r.data.tasks.every((t) => t.status === 'COMPLETED'));

  r = await req('GET', '/tasks?status=TODO', { token: userA.token });
  check('Filter status=TODO', r.status === 200 && r.data.tasks.every((t) => t.status === 'TODO'));

  r = await req('GET', '/tasks?priority=URGENT', { token: userA.token });
  check('Filter priority=URGENT', r.status === 200 && r.data.tasks.every((t) => t.priority === 'URGENT'));

  r = await req('GET', '/tasks?subject=' + testIds.subjectA, { token: userA.token });
  check('Filter by subject', r.status === 200 && r.data.tasks.every((t) => t.subject?.id === testIds.subjectA));

  r = await req('GET', '/tasks?topic=' + testIds.topicA, { token: userA.token });
  check('Filter by topic', r.status === 200 && r.data.tasks.every((t) => t.topic?.id === testIds.topicA));

  r = await req('GET', '/tasks?sort=due', { token: userA.token });
  check('Sort by due date', r.status === 200 && r.data.tasks.length >= 1);

  r = await req('GET', '/tasks?sort=priority', { token: userA.token });
  check('Sort by priority (desc)', r.status === 200);

  r = await req('GET', '/tasks?status=INVALID', { token: userA.token });
  check('Invalid status filter → 400', r.status === 400);

  r = await req('GET', '/tasks?priority=INVALID', { token: userA.token });
  check('Invalid priority filter → 400', r.status === 400);

  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  r = await req('GET', `/tasks?dueBefore=${tomorrow}`, { token: userA.token });
  check('Filter dueBefore', r.status === 200);

  r = await req('GET', '/tasks?overdue=true', { token: userA.token });
  check('Filter overdue', r.status === 200);

  console.log('\n[Cross-user security]');
  r = await req('GET', `/tasks/${task1Id}`, { token: userB.token });
  check('GET A task with B token → 404', r.status === 404);

  r = await req('PUT', `/tasks/${task1Id}`, { token: userB.token, body: { title: 'hacked' } });
  check('PUT A task with B token → 404', r.status === 404);

  r = await req('DELETE', `/tasks/${task1Id}`, { token: userB.token });
  check('DELETE A task with B token → 404', r.status === 404);

  r = await req('PATCH', `/tasks/${task1Id}/complete`, { token: userB.token });
  check('PATCH A task complete with B token → 404', r.status === 404);

  const bSubj = await req('POST', '/subjects', { token: userB.token, body: { name: 'B-Subject-TaskTest' } });
  const bSubjId = bSubj.data.subject.id;
  r = await req('POST', '/tasks', { token: userA.token, body: { title: 'B-ref task', subject: bSubjId } });
  check('A using B subject ref → 404 Subject not found', r.status === 404 && r.data.message === 'Subject not found.');

  r = await req('GET', '/tasks', { token: userB.token });
  check('B task list is empty (or separate)', r.status === 200 && r.data.tasks.length === 0);

  console.log('\n[Delete]');
  r = await req('DELETE', `/tasks/${task3Id}`, { token: userA.token });
  check('DELETE task → 200', r.status === 200 && r.data.deleted === true);

  r = await req('GET', `/tasks/${task3Id}`, { token: userA.token });
  check('Deleted task → 404', r.status === 404);

  r = await req('DELETE', `/tasks/${task3Id}`, { token: userA.token });
  check('Double delete → 404', r.status === 404);

  console.log('\n[Health regression]');
  r = await req('GET', '/health');
  check('GET /api/health → 200', r.status === 200 && r.data.success === true);

  console.log('\n[Cleanup]');
  try {
    await Task.deleteMany({ user: { $in: [testIds.userA, testIds.userB] } });
    await User.deleteMany({ _id: { $in: testUsers } });
    await Topic.deleteMany({ user: { $in: [testIds.userA, testIds.userB] } });
    await Subject.deleteMany({ user: { $in: [testIds.userA, testIds.userB] } });
    console.log('  Cleaned up test data');
  } catch (e) {
    console.log('  Cleanup warning:', e.message);
  }

  await mongoose.disconnect();
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

import { default as Task } from './src/models/Task.js';
import { default as User } from './src/models/User.js';
import { default as Subject } from './src/models/Subject.js';
import { default as Topic } from './src/models/Topic.js';

main().catch((err) => {
  console.error('FATAL', err);
  process.exit(1);
});