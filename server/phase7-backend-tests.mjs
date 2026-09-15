import mongoose from 'mongoose';
import { env } from './src/config/env.js';

import { default as User } from './src/models/User.js';
import { default as Subject } from './src/models/Subject.js';
import { default as Task } from './src/models/Task.js';
import { default as StudySession } from './src/models/StudySession.js';

const BASE = 'http://localhost:5000/api';
const testUsers = [];

const ids = {
  userA: null,
  userB: null,
  userC: null,
  subjectMath: null,
  subjectPhys: null,
  goalHit: null,
  goalSoft: null,
  goalTargetToday: null,
  milestoneOne: null,
  milestoneTwo: null,
  examFinal: null,
  examToday: null,
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

function z(pad, value) {
  return String(value).padStart(pad, '0');
}

function isoLocal(d) {
  return `${d.getFullYear()}-${z(2, d.getMonth() + 1)}-${z(2, d.getDate())}T${z(2, d.getHours())}:${z(2, d.getMinutes())}:${z(2, d.getSeconds())}.000`;
}

function daysFromNow(n, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function dateParam(d) {
  return `${d.getFullYear()}-${z(2, d.getMonth() + 1)}-${z(2, d.getDate())}`;
}

async function main() {
  console.log('=== Phase 7 Backend Tests: Planner, Goals, Exams ===');

  await mongoose.connect(env.mongoUri);

  console.log('\n[Auth guard]');
  let r = await req('GET', '/goals');
  check('GET /goals without token → 401', r.status === 401);
  r = await req('GET', '/exams');
  check('GET /exams without token → 401', r.status === 401);
  r = await req('GET', '/planner/day');
  check('GET /planner/day without token → 401', r.status === 401);

  console.log('\n[Empty state]');
  const emptyUser = await registerFresh('e7');
  r = await req('GET', '/goals', { token: emptyUser.token });
  check('Empty goals array', r.status === 200 && Array.isArray(r.data.goals) && r.data.goals.length === 0);
  r = await req('GET', '/exams', { token: emptyUser.token });
  check('Empty exams array', r.status === 200 && Array.isArray(r.data.exams) && r.data.exams.length === 0);
  r = await req('GET', '/planner/day', { token: emptyUser.token });
  check('Planner day 200 with empty slices', r.status === 200 && r.data.day.tasks.length === 0 && r.data.day.sessions.length === 0);
  r = await req('GET', '/planner/week', { token: emptyUser.token });
  check('Planner week has 7 days', r.status === 200 && r.data.week.days.length === 7);

  console.log('\n[User A — subjects + setup]');
  const userA = await registerFresh('gA');
  ids.userA = userA.user.id;

  r = await req('POST', '/subjects', { token: userA.token, body: { name: 'Math-G7', color: '#7c3aed' } });
  ids.subjectMath = r.data.subject.id;
  r = await req('POST', '/subjects', { token: userA.token, body: { name: 'Phys-G7', color: '#0ea5e9' } });
  ids.subjectPhys = r.data.subject.id;
  r = await req('POST', '/subjects', { token: userA.token, body: { name: 'Chem-G7', color: '#f59e0b' } });
  const subjectChem = r.data.subject.id;

  check('setup: two subjects created', Boolean(ids.subjectMath) && Boolean(ids.subjectPhys));

  console.log('\n[Goals CRUD]');
  const now = new Date();
  const inTwoWeeks = daysFromNow(14);
  const tomorrow = daysFromNow(1);

  r = await req('POST', '/goals', { token: userA.token, body: { title: 'Score 90% in Finals', description: 'Revise everything', type: 'SHORT_TERM', targetDate: isoLocal(inTwoWeeks), priority: 'HIGH', relatedSubjects: [ids.subjectMath, ids.subjectPhys] } });
  check('Create goal → 201', r.status === 201, `got ${r.status} ${JSON.stringify(r.data)}`);
  check('Goal serialized with progress 0', r.data.goal.progress === 0 && r.data.goal.milestones.length === 0);
  check('Goal relatedSubjects resolved', r.data.goal.relatedSubjects.length === 2);
  ids.goalHit = r.data.goal.id;

  r = await req('POST', '/goals', { token: userA.token, body: { title: 'Read 20 pages daily' } });
  check('Create goal with defaults', r.status === 201 && r.data.goal.type === 'SHORT_TERM' && r.data.goal.status === 'ACTIVE' && r.data.goal.priority === 'MEDIUM');
  ids.goalSoft = r.data.goal.id;

  r = await req('POST', '/goals', { token: userA.token, body: { title: 'Finish notes by tomorrow', targetDate: isoLocal(tomorrow) } });
  check('Create goal with targetDate tomorrow', r.status === 201 && r.data.goal.targetDate != null);
  ids.goalTargetToday = r.data.goal.id;

  r = await req('POST', '/goals', { token: userA.token, body: {} });
  check('Create goal without title → 400', r.status === 400);

  r = await req('POST', '/goals', { token: userA.token, body: { title: 'Hi', relatedSubjects: ['not-an-id'] } });
  check('Create goal bad subject ref → 400', r.status === 400);

  r = await req('POST', '/goals', { token: userA.token, body: { title: 'Hi', relatedSubjects: [new mongoose.Types.ObjectId().toString()] } });
  check('Create goal foreign subject ref → 404', r.status === 404);

  r = await req('GET', '/goals', { token: userA.token });
  check('List goals has 3', r.status === 200 && r.data.goals.length === 3);

  r = await req('GET', `/goals/${ids.goalHit}`, { token: userA.token });
  check('Get single goal → 200', r.status === 200 && r.data.goal.id === ids.goalHit);

  r = await req('GET', '/goals/not-an-id', { token: userA.token });
  check('Get goal bad id → 400', r.status === 400);

  r = await req('GET', `/goals/${new mongoose.Types.ObjectId().toString()}`, { token: userA.token });
  check('Get missing goal → 404', r.status === 404);

  r = await req('PUT', `/goals/${ids.goalSoft}`, { token: userA.token, body: { title: 'Read 50 pages daily', description: 'Even on weekends', type: 'HABIT' } });
  check('Update goal → 200', r.status === 200 && r.data.goal.title === 'Read 50 pages daily' && r.data.goal.type === 'HABIT');

  r = await req('PUT', `/goals/${ids.goalSoft}`, { token: userA.token, body: { status: 'NONSENSE' } });
  check('Update goal bad status → 400', r.status === 400);

  console.log('\n[Milestones CRUD]');
  r = await req('POST', `/goals/${ids.goalHit}/milestones`, { token: userA.token, body: { title: 'Finish Trigonometry' } });
  check('Create milestone → 201', r.status === 201, `got ${r.status}`);
  ids.milestoneOne = r.data.milestone.id;
  check('Milestone default status/order', r.data.milestone.status === 'PENDING' && r.data.milestone.order === 0);

  r = await req('POST', `/goals/${ids.goalHit}/milestones`, { token: userA.token, body: { title: 'Mock paper', targetDate: isoLocal(inTwoWeeks) } });
  check('Create second milestone default order 1', r.status === 201 && r.data.milestone.order === 1);
  ids.milestoneTwo = r.data.milestone.id;

  r = await req('POST', `/goals/${ids.goalTargetToday}/milestones`, { token: userA.token, body: { title: 'Notes chapter 1-3', targetDate: isoLocal(tomorrow) } });
  check('Create milestone on tomorrow goal', r.status === 201);

  r = await req('GET', `/goals/${ids.goalHit}`, { token: userA.token });
  check('Goal now has 2 milestones & 0%', r.data.goal.milestones.length === 2 && r.data.goal.milestoneStats.total === 2 && r.data.goal.progress === 0);

  r = await req('GET', '/goals/not-an-id/milestones', { token: userA.token });
  check('Milestones for bad goal → 400', r.status === 400);

  r = await req('GET', `/goals/${new mongoose.Types.ObjectId().toString()}/milestones`, { token: userA.token });
  check('Milestones for missing goal → 404', r.status === 404);

  r = await req('PATCH', `/goals/${ids.goalHit}/milestones/${ids.milestoneOne}/complete`, { token: userA.token });
  check('Complete milestone → 200', r.status === 200 && r.data.milestone.status === 'COMPLETED' && r.data.milestone.completedAt != null);

  r = await req('PATCH', `/goals/${ids.goalHit}/milestones/${ids.milestoneOne}/complete`, { token: userA.token });
  check('Complete milestone twice → 409', r.status === 409);

  r = await req('GET', `/goals/${ids.goalHit}`, { token: userA.token });
  check('Goal progress 50%', r.data.goal.progress === 50, `got ${r.data.goal.progress}`);

  r = await req('PATCH', `/goals/${ids.goalHit}/milestones/${ids.milestoneOne}/uncomplete`, { token: userA.token });
  check('Uncomplete milestone → 200 PENDING', r.status === 200 && r.data.milestone.status === 'PENDING' && r.data.milestone.completedAt === null);

  r = await req('PATCH', `/goals/${ids.goalHit}/milestones/${ids.milestoneOne}/uncomplete`, { token: userA.token });
  check('Uncomplete pending milestone → 409', r.status === 409);

  r = await req('PUT', `/goals/${ids.goalHit}/milestones/${ids.milestoneOne}`, { token: userA.token, body: { title: 'Finish Trigonometry + Hybrids', status: 'COMPLETED', order: 5 } });
  check('Update milestone via PUT (status complete sets completedAt)', r.status === 200 && r.data.milestone.title === 'Finish Trigonometry + Hybrids' && r.data.milestone.status === 'COMPLETED' && r.data.milestone.completedAt != null && r.data.milestone.order === 5);

  r = await req('GET', `/goals/${ids.goalHit}`, { token: userA.token });
  check('Goal progress 50% again after PUT', r.data.goal.progress === 50);

  r = await req('GET', '/goals', { token: userA.token });
  const hitGoal = r.data.goals.find((g) => g.id === ids.goalHit);
  check('List embeds milestones', hitGoal.milestones.length === 2);

  r = await req('DELETE', `/goals/${ids.goalHit}/milestones/${ids.milestoneTwo}`, { token: userA.token });
  check('Delete milestone → 200', r.status === 200 && r.data.deleted === true);

  r = await req('GET', `/goals/${ids.goalHit}`, { token: userA.token });
  check('Goal has 1 milestone after delete', r.data.goal.milestones.length === 1);

  console.log('\n[Goals — duplicate transitions]');
  r = await req('PATCH', `/goals/${ids.goalSoft}/complete`, { token: userA.token });
  check('Complete goal → 200', r.status === 200 && r.data.goal.status === 'COMPLETED' && r.data.goal.completedAt != null);

  r = await req('PATCH', `/goals/${ids.goalHit}/uncomplete`, { token: userA.token });
  check('Uncomplete ACTIVE goal → 409', r.status === 409);

  r = await req('PATCH', `/goals/${ids.goalHit}/complete`, { token: userA.token });
  check('Complete ACTIVE goal → 200', r.status === 200 && r.data.goal.status === 'COMPLETED');
  r = await req('PATCH', `/goals/${ids.goalHit}/complete`, { token: userA.token });
  check('Complete goal twice → 409', r.status === 409);

  r = await req('GET', '/goals?status=COMPLETED', { token: userA.token });
  check('Filter goals by status', r.status === 200 && r.data.goals.length === 2 && r.data.goals.every((g) => g.status === 'COMPLETED'));

  r = await req('GET', '/goals?status=NONSENSE', { token: userA.token });
  check('Filter goals bad status → 400', r.status === 400);

  r = await req('DELETE', `/goals/${ids.goalSoft}`, { token: userA.token });
  check('Delete goal → 200', r.status === 200 && r.data.deleted === true);

  console.log('\n[Exams CRUD]');
  const inTwentyDays = daysFromNow(20);
  r = await req('POST', '/exams', {
    token: userA.token,
    body: { title: 'Final Mathematics Exam', description: 'Covers everything', examDate: isoLocal(inTwentyDays), examTime: '09:00', location: 'Hall A', priority: 'HIGH', subjects: [ids.subjectMath] },
  });
  check('Create exam → 201', r.status === 201, `got ${r.status} ${JSON.stringify(r.data)}`);
  check('Exam serialized with daysUntil 20', r.data.exam.daysUntil === 20, `got ${r.data.exam.daysUntil}`);
  check('Exam subjects populated', r.data.exam.subjects.length === 1 && r.data.exam.subjects[0].id === ids.subjectMath);
  ids.examFinal = r.data.exam.id;

  r = await req('POST', '/exams', {
    token: userA.token,
    body: { title: 'Chemistry Quiz', examDate: isoLocal(tomorrow), subjects: [ids.subjectPhys] },
  });
  check('Create exam default status', r.status === 201 && r.data.exam.status === 'UPCOMING' && r.data.exam.priority === 'MEDIUM');
  ids.examQuiz = r.data.exam.id;

  r = await req('POST', '/exams', { token: userA.token, body: { title: 'No date' } });
  check('Create exam without date → 400', r.status === 400);

  r = await req('POST', '/exams', { token: userA.token, body: { title: 'X', examDate: isoLocal(inTwentyDays), subjects: [new mongoose.Types.ObjectId().toString()] } });
  check('Create exam foreign subject → 404', r.status === 404);

  r = await req('POST', '/exams', { token: userA.token, body: { title: 'X', examDate: isoLocal(inTwentyDays), subjects: ['bad-id'] } });
  check('Create exam bad subject ref → 400', r.status === 400);

  r = await req('GET', '/exams', { token: userA.token });
  check('List exams has 2', r.status === 200 && r.data.exams.length === 2);

  r = await req('GET', `/exams/${ids.examFinal}`, { token: userA.token });
  check('Get single exam → 200', r.status === 200 && r.data.exam.id === ids.examFinal);

  r = await req('GET', `/exams/${new mongoose.Types.ObjectId().toString()}`, { token: userA.token });
  check('Get missing exam → 404', r.status === 404);

  r = await req('PUT', `/exams/${ids.examFinal}`, { token: userA.token, body: { title: 'Final Mathematics Exam (Written)', location: 'Hall B', subjects: [ids.subjectMath, ids.subjectPhys] } });
  check('Update exam → 200', r.status === 200 && r.data.exam.title === 'Final Mathematics Exam (Written)' && r.data.exam.location === 'Hall B' && r.data.exam.subjects.length === 2);

  r = await req('GET', '/exams/upcoming', { token: userA.token });
  check('Upcoming exams list', r.status === 200 && r.data.exams.length === 2);

  console.log('\n[Exam transitions]');
  r = await req('PATCH', `/exams/${ids.examFinal}/complete`, { token: userA.token });
  check('Complete exam → 200 COMPLETED', r.status === 200 && r.data.exam.status === 'COMPLETED' && r.data.exam.completedAt != null);

  r = await req('PATCH', `/exams/${ids.examFinal}/complete`, { token: userA.token });
  check('Complete exam twice → 409', r.status === 409);

  r = await req('PATCH', `/exams/${ids.examFinal}/cancel`, { token: userA.token });
  check('Cancel completed exam → 409', r.status === 409);

  r = await req('PATCH', `/exams/${ids.examFinal}/reopen`, { token: userA.token });
  check('Reopen exam → 200 UPCOMING', r.status === 200 && r.data.exam.status === 'UPCOMING' && r.data.exam.completedAt === null);

  r = await req('PATCH', `/exams/${ids.examFinal}/reopen`, { token: userA.token });
  check('Reopen upcoming exam → 409', r.status === 409);

  r = await req('PATCH', `/exams/${ids.examFinal}/cancel`, { token: userA.token });
  check('Cancel upcoming exam → 200 CANCELLED', r.status === 200 && r.data.exam.status === 'CANCELLED');

  r = await req('PATCH', `/exams/${ids.examFinal}/cancel`, { token: userA.token });
  check('Cancel twice → 409', r.status === 409);

  r = await req('PATCH', `/exams/${ids.examFinal}/reopen`, { token: userA.token });
  check('Reopen cancelled exam → 200', r.status === 200 && r.data.exam.status === 'UPCOMING');

  console.log('\n[Ownership isolation]');
  const userB = await registerFresh('gB');
  ids.userB = userB.user.id;

  r = await req('GET', `/goals/${ids.goalHit}`, { token: userB.token });
  check('User B cannot read A goal → 404', r.status === 404);

  r = await req('GET', `/exams/${ids.examFinal}`, { token: userB.token });
  check('User B cannot read A exam → 404', r.status === 404);

  r = await req('PUT', `/goals/${ids.goalHit}`, { token: userB.token, body: { title: 'hax' } });
  check('User B cannot update A goal → 404', r.status === 404);

  r = await req('GET', `/goals/${ids.goalHit}/milestones`, { token: userB.token });
  check('User B cannot read A milestones → 404', r.status === 404);

  r = await req('DELETE', `/milestones/${ids.milestoneOne}`, { token: userB.token });
  check('User B cannot delete A milestone (top-level) → 404', r.status === 404);

  r = await req('DELETE', `/goals/${ids.goalHit}`, { token: userB.token });
  check('User B cannot delete A goal → 404', r.status === 404);

  r = await req('DELETE', `/exams/${ids.examFinal}`, { token: userB.token });
  check('User B cannot delete A exam → 404', r.status === 404);

  r = await req('GET', '/goals', { token: userB.token });
  check('User B goals empty', r.status === 200 && r.data.goals.length === 0);

  r = await req('GET', '/planner/day', { token: userB.token });
  check('User B planner day empty', r.status === 200 && r.data.day.tasks.length === 0 && r.data.day.exams.length === 0);

  console.log('\n[Top-level milestone routes]');
  r = await req('PUT', `/milestones/${ids.milestoneOne}`, { token: userA.token, body: { title: 'Top-level rename' } });
  check('PUT /milestones/:id → 200', r.status === 200 && r.data.milestone.title === 'Top-level rename');

  r = await req('DELETE', `/milestones/${ids.milestoneOne}`, { token: userA.token });
  check('DELETE /milestones/:id → 200', r.status === 200 && r.data.deleted === true);
  ids.milestoneOne = null;

  console.log('\n[Planner — day view]');
  const tomorrowParam = dateParam(tomorrow);

  r = await req('PUT', `/goals/${ids.goalTargetToday}`, { token: userA.token, body: { status: 'ACTIVE', targetDate: isoLocal(tomorrow) } });
  check('Goal target tomorrow kept', r.status === 200);

  r = await req('POST', '/tasks', {
    token: userA.token,
    body: { title: 'Solve past paper', subject: ids.subjectMath, dueDate: isoLocal(tomorrow), estimatedMinutes: 90 },
  });
  const taskTomorrow = r.data.task.id;

  r = await req('POST', '/tasks', {
    token: userA.token,
    body: { title: 'Late submission', subject: ids.subjectPhys, dueDate: isoLocal(daysFromNow(-2)), estimatedMinutes: 45 },
  });

  r = await req('POST', '/tasks', {
    token: userA.token,
    body: { title: 'Finished yesterday', subject: ids.subjectMath, dueDate: isoLocal(daysFromNow(-1)), status: 'COMPLETED', estimatedMinutes: 30 },
  });

  const sessionStart = daysFromNow(-1, 15);
  await StudySession.create({
    user: ids.userA,
    subject: ids.subjectMath,
    mode: 'STUDY',
    status: 'COMPLETED',
    startedAt: sessionStart,
    durationSeconds: 3600,
  });
  check('Seeded completed study session yesterday', true);

  r = await req('GET', `/planner/day?date=${dateParam(daysFromNow(-1))}`, { token: userA.token });
  check('Planner yesterday → 200 has session', r.status === 200 && r.data.day.sessions.length === 1, `got ${r.status} ${JSON.stringify(r.data)}`);
  check('Planner yesterday session studySeconds > 0', r.data.day.studySeconds > 0);
  check('Planner yesterday has completed task', r.data.day.totalTasks === 1 && r.data.day.completedTasks === 1);

  r = await req('GET', `/planner/day?date=${tomorrowParam}`, { token: userA.token });
  check('Planner tomorrow → 200 has 1 task', r.status === 200 && r.data.day.tasks.length === 1, `got ${r.status} ${JSON.stringify(r.data)}`);
  check('Planner tomorrow plannedMinutes 90', r.data.day.plannedMinutes === 90, `got ${r.data.day.plannedMinutes}`);
  check('Planner tomorrow isTomorrow label', r.data.day.dayLabel === 'Tomorrow');
  check('Planner tomorrow has milestone due', r.data.day.milestonesDue.length === 1, `got ${JSON.stringify(r.data.day.milestonesDue)}`);
  check('Planner tomorrow has goal due', r.data.day.goals.length === 1);

  r = await req('POST', '/exams', { token: userA.token, body: { title: 'Surprise Test', examDate: isoLocal(daysFromNow(1, 8)) } });
  ids.examToday = r.data.exam.id;

  r = await req('GET', `/planner/day?date=${tomorrowParam}`, { token: userA.token });
  check('Planner tomorrow includes exam', r.data.day.exams.some((e) => e.id === ids.examToday));

  r = await req('GET', '/planner/day?date=2026-13-99', { token: userA.token });
  check('Planner bad date → 400', r.status === 400);
  r = await req('GET', '/planner/day?date=notadate', { token: userA.token });
  check('Planner non-date → 400', r.status === 400);

  console.log('\n[Planner — week view + overview]');
  r = await req('GET', `/planner/week?startDate=${tomorrowParam}`, { token: userA.token });
  check('Planner week from tomorrow → 200', r.status === 200, `got ${r.status}`);
  const t2 = new Date(tomorrow);
  const t2Day = t2.getDay();
  const t2Offset = t2Day === 0 ? -6 : -(t2Day - 1);
  const expectedMonday = dateParam(new Date(t2.getFullYear(), t2.getMonth(), t2.getDate() + t2Offset));
  check('Planner week anchors to that week Monday', r.data.week.startDate === expectedMonday, `got ${r.data.week.startDate} want ${expectedMonday}`);
  const weekHasTomorrow = r.data.week.days.some((d) => d.date === tomorrowParam);
  check('Week contains requested start day', weekHasTomorrow);
  const tomorrowDay = r.data.week.days.find((d) => d.date === tomorrowParam);
  check('Week embeds tomorrow task', tomorrowDay.tasks.length === 1);

  r = await req('GET', '/planner/week', { token: userA.token });
  check('Planner week default anchors Monday', r.status === 200 && r.data.week.startDate != null);

  r = await req('GET', '/planner/overview', { token: userA.token });
  check('Planner overview 200', r.status === 200, `got ${r.status}`);
  check('Overview nextExam is Surprise Test', r.data.overview.nextExam != null && r.data.overview.nextExam.id === ids.examToday);
  check('Overview has activeGoals count', r.data.overview.activeGoals === 1);
  check('Overview today shape present', Boolean(r.data.overview.today) && typeof r.data.overview.today.studySeconds === 'number');

  console.log('\n[Cleanup stores]');
  await req('DELETE', `/goals/${ids.goalTargetToday}`, { token: userA.token });
  await req('DELETE', `/goals/${ids.goalHit}`, { token: userA.token });
  await req('DELETE', `/exams/${ids.examToday}`, { token: userA.token });
  await req('DELETE', `/exams/${ids.examQuiz}`, { token: userA.token });
  await req('DELETE', `/exams/${ids.examFinal}`, { token: userA.token });

  r = await req('GET', '/goals', { token: userA.token });
  check('Goals cleaned', r.status === 200 && r.data.goals.length === 0);
  r = await req('GET', '/exams', { token: userA.token });
  check('Exams cleaned', r.status === 200 && r.data.exams.length === 0);

  console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
  await User.deleteMany({ _id: { $in: testUsers } });
  await mongoose.disconnect();

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .then(() => {
    console.log('Phase 7 backend tests completed.');
  })
  .catch((error) => {
    console.error('Phase 7 backend tests crashed:', error);
    mongoose
      .disconnect()
      .finally(() => {
        process.exitCode = 1;
      });
  });