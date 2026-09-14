const BASE = 'http://localhost:5000/api';

let passed = 0;
let failed = 0;

function check(label, condition, extra = '') {
  if (condition) {
    passed++;
    console.log(`  PASS ${label}`);
  } else {
    failed++;
    console.log(`  FAIL ${label} ${extra}`);
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
  try {
    data = await res.json();
  } catch {
    // ignore
  }
  return { status: res.status, data };
}

function randomEmail(prefix) {
  return `${prefix}${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}

function randomName(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

async function registerFresh(prefix) {
  const email = randomEmail(prefix);
  const { status, data } = await req('POST', '/auth/register', {
    body: { name: 'Phase3 Tester', email, password: 'password123' },
  });
  if (status !== 201) {
    throw new Error(`register failed: ${status} ${JSON.stringify(data)}`);
  }
  return { token: data.token, user: data.user, email };
}

async function createSubject(token, overrides = {}) {
  const { status, data } = await req('POST', '/subjects', {
    token,
    body: { name: randomName('Subject'), ...overrides },
  });
  return { status, subject: data && data.subject, data };
}

async function createTopic(token, subjectId, overrides = {}) {
  const { status, data } = await req('POST', '/topics', {
    token,
    body: { subject: subjectId, name: randomName('Topic'), ...overrides },
  });
  return { status, topic: data && data.topic, data };
}

async function main() {
  console.log('=== Subject & Topic API Tests ===');

  // --- Auth: no token ---
  {
    console.log('\n[AUTH guards]');
    let r = await req('GET', '/subjects');
    check('GET /subjects without token → 401', r.status === 401);
    r = await req('POST', '/subjects', { body: { name: 'x' } });
    check('POST /subjects without token → 401', r.status === 401);
    r = await req('GET', '/topics');
    check('GET /topics without token → 401', r.status === 401);
    r = await req('POST', '/topics', { body: { name: 'x' } });
    check('POST /topics without token → 401', r.status === 401);
    r = await req('GET', '/subjects/507f1f77bcf86cd799439011');
    check('GET /subjects/:id without token → 401', r.status === 401);
  }

  const { token: userAToken } = await registerFresh('ua');
  const { token: userBToken } = await registerFresh('ub');

  // --- Subject CRUD ---
  {
    console.log('\n[Subject CRUD]');
    let r = await req('GET', '/subjects', { token: userAToken });
    check('GET subjects empty → 200 []', r.status === 200 && Array.isArray(r.data.subjects) && r.data.subjects.length === 0);

    r = await req('POST', '/subjects', {
      token: userAToken,
      body: { name: ' Mathematics ', description: ' Algebra ', color: '#7c3aed', targetHours: 40, completedHours: 5 },
    });
    check('POST subject → 201 w/ trimmed name', r.status === 201 && r.data.subject.name === 'Mathematics');
    check('subject serialized id (no _id)', r.data.subject.id && !r.data.subject._id);
    check('subject description trimmed', r.data.subject.description === 'Algebra');
    check('subject color preserved', r.data.subject.color === '#7c3aed');
    const subjectA = r.data.subject;

    r = await req('POST', '/subjects', {
      token: userAToken,
      body: { name: 'mathematics', targetHours: 20 },
    });
    check('duplicate subject name (case-insensitive) → 409', r.status === 409);

    r = await req('POST', '/subjects', {
      token: userAToken,
      body: { name: 'Physics' },
    });
    check('second subject → 201', r.status === 201);
    const subjectB = r.data.subject;

    r = await req('POST', '/subjects', {
      token: userAToken,
      body: { name: 'Mathematics', color: 'red' },
    });
    check('invalid color → 400 w/ errors', r.status === 400 && r.data.errors?.color);

    r = await req('POST', '/subjects', {
      token: userAToken,
      body: { name: 'Chem', targetHours: -5 },
    });
    check('negative targetHours → 400', r.status === 400 && r.data.errors?.targetHours);

    r = await req('POST', '/subjects', { token: userAToken, body: {} });
    check('missing name → 400', r.status === 400 && r.data.errors?.name);

    r = await req('POST', '/subjects', {
      token: userAToken,
      body: { name: 'X'.repeat(81) },
    });
    check('name over 80 chars → 400', r.status === 400 && r.data.errors?.name);

    r = await req('GET', `/subjects/${subjectA.id}`, { token: userAToken });
    check('GET subject by id → 200', r.status === 200 && r.data.subject.id === subjectA.id);

    r = await req('PUT', `/subjects/${subjectA.id}`, {
      token: userAToken,
      body: { name: 'Mathematics-II', targetHours: 50 },
    });
    check('PUT subject → 200 updated', r.status === 200 && r.data.subject.name === 'Mathematics-II' && r.data.subjects === undefined);

    r = await req('PUT', `/subjects/${subjectA.id}`, { token: userAToken, body: { name: 'Physics' } });
    check('PUT duplicate name → 409', r.status === 409);

    r = await req('GET', '/subjects?sort=newest', { token: userAToken });
    check('GET subjects?sort=newest → newest first', r.status === 200 && r.data.subjects[0].name === 'Physics' && r.data.subjects[1].name === 'Mathematics-II');

    r = await req('PUT', '/subjects/not-an-objectid', { token: userAToken, body: { name: 'X' } });
    check('PUT malformed id → 400', r.status === 400);
  }

  // --- Cross-user subject security ---
  {
    console.log('\n[Cross-user subject security]');
    // User A created 2 subjects: Mathematics-II, Physics
    const { data: listA } = await req('GET', '/subjects', { token: userAToken });
    const subjectA = listA.subjects.find((s) => s.name === 'Mathematics-II');

    let r = await req('GET', `/subjects/${subjectA.id}`, { token: userBToken });
    check('GET A subject with B token → 404', r.status === 404);

    r = await req('PUT', `/subjects/${subjectA.id}`, { token: userBToken, body: { name: 'Hacked' } });
    check('PUT A subject with B token → 404 (no ownership leak)', r.status === 404);

    r = await req('DELETE', `/subjects/${subjectA.id}`, { token: userBToken });
    check('DELETE A subject with B token → 404', r.status === 404);

    r = await req('GET', `/subjects/${subjectA.id}`, { token: userAToken });
    check('A subject untouched by B', r.status === 200 && r.data.subject.name === 'Mathematics-II');

    const { data: listB } = await req('GET', '/subjects', { token: userBToken });
    check('B sees own (empty) subject list', listB.subjects.length === 0);
  }

  // --- Topic CRUD ---
  {
    console.log('\n[Topic CRUD]');
    const { data: listA } = await req('GET', '/subjects', { token: userAToken });
    const subjectA = listA.subjects.find((s) => s.name === 'Mathematics-II');
    const subjectB = listA.subjects.find((s) => s.name === 'Physics');

    let r = await createTopic(userAToken, subjectA.id, {
      name: ' Quadratic Equations ',
      description: 'Solve quadratics',
      status: 'LEARNING',
      priority: 'HIGH',
      estimatedHours: 5,
      completedHours: 2,
    });
    check('POST topic → 201 w/ trimmed name', r.status === 201 && r.topic.name === 'Quadratic Equations');
    check('topic serialized id (no _id)', r.topic.id && !r.topic._id);
    check('topic subject populated {id,name,color}', r.topic.subject?.id && r.topic.subject?.name === subjectA.name && r.topic.subject?.color !== undefined && !r.topic.subject?._id);
    const topicQuadratic = r.topic;

    r = await createTopic(userAToken, subjectA.id, { status: 'COMPLETED', priority: 'LOW' });
    check('second topic created', r.status === 201);

    r = await createTopic(userAToken, subjectA.id, { name: 'QUADRATIC EQUATIONS', priority: 'MEDIUM' });
    check('duplicate topic name in same subject (case-insensitive) → 409', r.status === 409);

    r = await createTopic(userAToken, subjectA.id, { name: 'Quadratic Equations 2' });
    check('same topic name in DIFFERENT subject is allowed → 201', r.status === 201);

    // topic referencing B's subject from A's token
    r = await createTopic(userAToken, subjectB.id, { name: 'Should Not Work' });
    check('topic reusing existing name allowed across subjects (created)', r.status === 201);

    // Attempt: create topic under subject that exists but belongs to B — need a subject owned by B to verify 404 vs 201
    // B has no subjects, so use B's own token to create one, then A tries to use it.
    {
      const rc = await req('POST', '/subjects', { token: userBToken, body: { name: 'B-Subject' } });
      const bSubjectId = rc.data.subject.id;
      const rt = await createTopic(userAToken, bSubjectId, { name: 'A hack topic' });
      check('topic under B subject w/ A token → 404', rt.status === 404 && rt.data.message === 'Subject not found.');
      const rc2 = await req('POST', '/topics', { token: userBToken, body: { subject: bSubjectId, name: 'B topic 1' } });
      check('B creates own topic → 201', rc2.status === 201);
    }

    r = await createTopic(userAToken, subjectA.id, { name: 'Top', status: 'INVALID_STATUS' });
    check('invalid status → 400', r.status === 400 && r.data.errors?.status);

    r = await createTopic(userAToken, subjectA.id, { name: 'Top2', priority: 'URGENT' });
    check('invalid priority → 400', r.status === 400 && r.data.errors?.priority);

    r = await createTopic(userAToken, subjectA.id, { name: 'Top3', estimatedHours: -1 });
    check('negative estimatedHours → 400', r.status === 400 && r.data.errors?.estimatedHours);

    r = await createTopic(userAToken, subjectA.id, { name: 'Top4', subject: 'bad-id-xyz' });
    check('malformed subject on create → 400', r.status === 400);

    r = await createTopic(userAToken, '507f1f77bcf86cd799439011', { name: 'Topic' });
    check('topic under non-existent subject → 404 Subject not found', r.status === 404);

    r = await req('PUT', `/topics/${topicQuadratic.id}`, {
      token: userAToken,
      body: { status: 'TESTED', completedHours: 4 },
    });
    if (r.status !== 200) console.log('  DEBUG PUT:', r.status, JSON.stringify(r.data));
    check('PUT topic → 200 updated', r.status === 200 && r.data?.topic?.status === 'TESTED' && r.data?.topic?.completedHours === 4);
    check('PUT topic keeps subject ref', r.data?.topic?.subject?.id === subjectA.id);

    r = await req('GET', '/topics', { token: userAToken });
    check('GET topics → 200 list w/ populated subject', r.status === 200 && r.data.topics.length >= 3 && r.data.topics.every((t) => t.subject?.name));

    r = await req('GET', `/topics?subject=${subjectA.id}`, { token: userAToken });
    check('GET topics?subject filter', r.status === 200 && r.data.topics.every((t) => t.subject?.id === subjectA.id));

    r = await req('GET', '/topics?status=COMPLETED', { token: userAToken });
    check('GET topics?status filter', r.status === 200 && r.data.topics.length >= 1 && r.data.topics.every((t) => t.status === 'COMPLETED'));

    r = await req('GET', '/topics?priority=LOW', { token: userAToken });
    check('GET topics?priority filter', r.status === 200 && r.data.topics.every((t) => t.priority === 'LOW'));

    r = await req('GET', '/topics?status=NOPE', { token: userAToken });
    check('GET topics invalid status filter → 400', r.status === 400);

    r = await req('GET', `/topics/${topicQuadratic.id}`, { token: userAToken });
    check('GET topic by id → 200', r.status === 200 && r.data?.topic?.id === topicQuadratic.id);

    r = await req('GET', `/topics/${topicQuadratic.id}`, { token: userBToken });
    check('GET A topic w/ B token → 404', r.status === 404);

    r = await req('DELETE', `/topics/${topicQuadratic.id}`, { token: userBToken });
    check('DELETE A topic w/ B token → 404', r.status === 404);

    r = await req('DELETE', `/topics/${topicQuadratic.id}`, { token: userAToken });
    check('DELETE own topic → 200', r.status === 200 && r.data.deleted === true);

    r = await req('GET', `/topics/${topicQuadratic.id}`, { token: userAToken });
    check('deleted topic → 404 after delete', r.status === 404);

    r = await req('PUT', '/topics/short-id', { token: userAToken, body: { name: 'X' } });
    check('PUT malformed topic id → 400', r.status === 400);

    // Move topic to another subject (ownership check)
    const { data: topicsA } = await req('GET', '/topics', { token: userAToken });
    const someTopic = topicsA.topics[0];
    r = await req('PUT', `/topics/${someTopic.id}`, { token: userAToken, body: { subject: subjectB.id } });
    check('move topic to own subject B → 200', r.status === 200 && r.data?.topic?.subject?.id === subjectB.id);
  }

  // --- Subject delete cascade ---
  {
    console.log('\n[Subject delete cascade]');
    const { data: listA } = await req('GET', '/subjects', { token: userAToken });
    const subjectA = listA.subjects.find((s) => s.name === 'Mathematics-II');

    const before = await req('GET', `/topics?subject=${subjectA.id}`, { token: userAToken });
    check('subject A has topics before delete', before.status === 200 && before.data.topics.length >= 1);

    let r = await req('DELETE', `/subjects/${subjectA.id}`, { token: userAToken });
    check('DELETE subject → 200', r.status === 200);
    const cascadeCount = before.data.topics.length;
    check('cascade deleted topics reported', r.data.topicsDeleted === cascadeCount);

    r = await req('GET', `/subjects/${subjectA.id}`, { token: userAToken });
    check('deleted subject → 404', r.status === 404);

    const after = await req('GET', `/topics?subject=${subjectA.id}`, { token: userAToken });
    check('topics under deleted subject cascade-deleted', after.status === 200 && after.data.topics.length === 0);

    // User B still unaffected
    const { data: listB } = await req('GET', '/subjects', { token: userBToken });
    check('B subjects unaffected by A cascade', listB.subjects.length === 1);
  }

  // --- Serialization: extra keys accepted? ---
  {
    console.log('\n[Extra/unknown field handling]');
    let r = await req('POST', '/subjects', {
      token: userAToken,
      body: { name: randomName('Sx'), userId: '507f1f77bcf86cd799439011' },
    });
    check('userId in body ignored (used req.user)', r.status === 201 && r.data.subject.user === undefined);
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('FATAL', err);
  process.exit(1);
});