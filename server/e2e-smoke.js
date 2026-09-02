/* End-to-end smoke test for the core commerce flow. */
require('dotenv').config();
const API = 'http://127.0.0.1:5000/api';
const ts = Date.now();
const stamp = `e2e${ts}`;

async function call(method, path, { token, body, params } = {}) {
  const url = new URL(API + path);
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, ok: res.ok, body: json };
}

function expect(name, cond, extra) {
  if (cond) console.log(`  ✓ ${name}`);
  else { console.log(`  ✗ ${name}`, extra ? JSON.stringify(extra).slice(0, 240) : ''); process.exitCode = 1; }
}

(async () => {
  console.log('\n=== 1. REGISTER ===');
  const reg = await call('POST', '/identity/auth/register', {
    body: { name: 'Smoke User', email: `${stamp}@test.com`, password: 'Passw0rd!', role: 'CUSTOMER' },
  });
  expect('register 201', reg.status === 201, reg.body);
  const { user, token } = reg.body.data || {};
  expect('user + token returned', !!user && !!token);
  const userId = user.userId;
  console.log('  userId =', userId);

  console.log('\n=== 2. CREATE CUSTOMER ===');
  const cust = await call('POST', '/customers', {
    token,
    body: { userId, name: 'Smoke User', email: `${stamp}@test.com`, city: 'Kolkata' },
  });
  expect('customer 201', cust.status === 201, cust.body);
  const customerId = cust.body.data?.customerId;
  console.log('  customerId =', customerId);

  console.log('\n=== 3. GET CUSTOMER BY USER ===');
  const byUser = await call('GET', `/customers/by-user/${userId}`, { token });
  expect('by-user 200', byUser.status === 200, byUser.body);
  expect('matches customerId', byUser.body.data?.customerId === customerId);

  console.log('\n=== 4. CREATE ORGANIZATION ===');
  const org = await call('POST', '/identity/organizations', {
    token,
    body: {
      name: `${stamp} Studio`,
      kind: 'VENDOR',
      capabilities: ['VENDOR'],
      categories: ['PHOTOGRAPHY', 'VIDEO'],
      city: 'Kolkata',
      country: 'IN',
      description: 'Smoke test vendor',
    },
  });
  expect('organization 201', org.status === 201, org.body);
  const organizationId = org.body.data?.organizationId;
  console.log('  organizationId =', organizationId);

  console.log('\n=== 5. CREATE OFFERING ===');
  const off = await call('POST', '/offerings', {
    token,
    body: {
      organizationId,
      title: `${stamp} Wedding Photography`,
      category: 'PHOTOGRAPHY',
      pricingModel: 'FIXED',
      basePriceMinor: 150000,
      currency: 'INR',
      description: 'Premium wedding photography',
    },
  });
  expect('offering 201', off.status === 201, off.body);
  const offeringId = off.body.data?.offeringId;
  console.log('  offeringId =', offeringId);

  console.log('\n=== 6. CREATE INQUIRY ===');
  const inq = await call('POST', '/inquiries', {
    token,
    body: {
      customerId,
      organizationId,
      offeringId,
      title: 'Wedding Inquiry',
      subject: 'Looking for wedding photographer',
      intent: 'BOOK_NOW',
      budgetMinMinor: 100000,
      budgetMaxMinor: 250000,
      currency: 'INR',
      eventDate: '2026-12-12',
      city: 'Kolkata',
      guestCount: 200,
    },
  });
  expect('inquiry 201', inq.status === 201, inq.body);
  const inquiryId = inq.body.data?.inquiryId;
  console.log('  inquiryId =', inquiryId);

  console.log('\n=== 7. INQUIRY ACTIVITY ===');
  const inqActivity = await call('GET', `/activity/inquiry/${inquiryId}`, { token });
  expect('inquiry activity 200', inqActivity.status === 200, inqActivity.body);
  expect('activity has items', (inqActivity.body.data?.length || inqActivity.body.items?.length || 0) >= 1);

  console.log('\n=== 8. CREATE QUOTE ===');
  const qte = await call('POST', '/quotes', {
    token,
    body: {
      customerId,
      organizationId,
      offeringId,
      inquiryId,
      title: `${stamp} Wedding Quote`,
      description: 'Photography + videography package',
      lineItems: [
        { title: 'Photography 8 hours', description: 'Wedding photography', quantity: 1, unitPriceMinor: 150000 },
        { title: 'Videography 6 hours', description: 'Cinematic video', quantity: 1, unitPriceMinor: 120000 },
      ],
      currency: 'INR',
      validUntil: '2026-10-01',
    },
  });
  expect('quote 201', qte.status === 201, qte.body);
  const quoteId = qte.body.data?.quoteId;
  console.log('  quoteId =', quoteId, 'totalMinor =', qte.body.data?.totalMinor);

  console.log('\n=== 9. SEND QUOTE ===');
  const sent = await call('POST', `/quotes/${quoteId}/send`, { token });
  expect('quote send 200', sent.status === 200, sent.body);
  expect('status SENT', sent.body.data?.status === 'SENT');

  console.log('\n=== 10. ACCEPT QUOTE → BOOKING ===');
  const acc = await call('POST', `/quotes/${quoteId}/accept`, {
    token,
    body: { idempotencyKey: `${stamp}-accept` },
  });
  expect('quote accept 200', acc.status === 200, acc.body);
  expect('quote ACCEPTED', acc.body.data?.quote?.status === 'ACCEPTED');
  const bookingId = acc.body.data?.booking?.bookingId;
  console.log('  bookingId =', bookingId);

  console.log('\n=== 11. CONFIRM BOOKING ===');
  const cfm = await call('PATCH', `/bookings/${bookingId}/status`, {
    token,
    body: { status: 'CONFIRMED' },
  });
  expect('booking confirm 200', cfm.status === 200, cfm.body);
  expect('booking CONFIRMED', cfm.body.data?.status === 'CONFIRMED');

  console.log('\n=== 12. RECORD PAYMENT ===');
  const pay = await call('POST', '/payments', {
    token,
    body: {
      customerId,
      bookingId,
      organizationId,
      amountMinor: 100000,
      currency: 'INR',
      method: 'BANK_TRANSFER',
      reference: `${stamp}-txn`,
    },
  });
  expect('payment 201', pay.status === 201, pay.body);
  const paymentId = pay.body.data?.paymentId;
  console.log('  paymentId =', paymentId);

  console.log('\n=== 13. ACTIVITY TIMELINES ===');
  for (const [type, id] of [['CUSTOMER', customerId], ['QUOTE', quoteId], ['BOOKING', bookingId]]) {
    const r = await call('GET', `/activity/timeline/${type}/${id}`, { token });
    expect(`activity ${type} ${id}`, r.status === 200 && ((r.body.data?.length || r.body.items?.length || 0) >= 1), r.body);
  }
  for (const path of [`/activity/customer/${customerId}`, `/activity/inquiry/${inquiryId}`, `/activity/quote/${quoteId}`, `/activity/booking/${bookingId}`]) {
    const r = await call('GET', path, { token });
    expect(`convenience ${path}`, r.status === 200, r.body);
  }

  console.log('\n=== 14. AUDIT LOG ===');
  const aud1 = await call('GET', `/audit/entity/BOOKING/${bookingId}`, { token });
  expect('audit entity 200', aud1.status === 200, aud1.body);
  const aud2 = await call('GET', `/audit?entityType=BOOKING&entityId=${bookingId}`, { token });
  expect('audit query 200', aud2.status === 200, aud2.body);

  console.log('\n=== 15. WORKSPACE LISTS ===');
  const listChecks = [
    `/inquiries/customer/${customerId}`,
    `/quotes/customer/${customerId}`,
    `/bookings/customer/${customerId}`,
    `/budget/customer/${customerId}`,
    `/tasks/customer/${customerId}`,
    `/timeline?customerId=${customerId}`,
    `/guests?customerId=${customerId}`,
  ];
  for (const path of listChecks) {
    const r = await call('GET', path, { token });
    expect(`list ${path}`, r.status === 200, r.body);
  }

  console.log('\n=== 16. OUTBOX (admin stats — expect 403, but listPending should work for ADMIN) ===');
  // Try as customer — expect 403
  const obsCust = await call('GET', '/outbox/stats', { token });
  expect('outbox stats 403 for customer', obsCust.status === 403, obsCust.body);

  console.log('\n=== 17. MESSAGES ===');
  const msg = await call('POST', '/messages', {
    token,
    body: { threadId: inquiryId, threadType: 'INQUIRY', senderType: 'CUSTOMER', body: 'Hi, looking forward!' },
  });
  expect('message 201', msg.status === 201, msg.body);

  const thread = await call('GET', `/messages/thread/${inquiryId}`, { token });
  expect('thread 200', thread.status === 200, thread.body);
  expect('thread has at least 1 msg', (thread.body.data?.length || 0) >= 1);

  console.log('\n=== 18. TASKS, GUESTS, TIMELINE ===');
  const t = await call('POST', '/tasks', {
    token,
    body: { customerId, title: 'Confirm headcount', category: 'PLANNING' },
  });
  expect('task 201', t.status === 201, t.body);
  const taskId = t.body.data?.taskId;

  const tPatch = await call('PATCH', `/tasks/${taskId}/status`, {
    token,
    body: { status: 'IN_PROGRESS' },
  });
  expect('task patch 200', tPatch.status === 200, tPatch.body);

  const g = await call('POST', '/guests', {
    token,
    body: { customerId, name: 'John Doe', side: 'FRIEND', rsvpStatus: 'PENDING' },
  });
  expect('guest 201', g.status === 201, g.body);

  const tl = await call('POST', '/timeline', {
    token,
    body: {
      customerId,
      title: 'Ceremony',
      startTime: '2026-12-12T10:00:00.000Z',
      endTime: '2026-12-12T11:00:00.000Z',
      category: 'CEREMONY',
    },
  });
  expect('timeline 201', tl.status === 201, tl.body);

  console.log('\n=== 19. DOCUMENTS ===');
  const doc = await call('POST', '/documents', {
    token,
    body: {
      customerId,
      bookingId,
      organizationId,
      kind: 'PROPOSAL',
      title: `${stamp} Proposal`,
      body: 'Our team will deliver the photography package as scoped.',
      currency: 'INR',
    },
  });
  expect('document 201', doc.status === 201, doc.body);

  console.log('\n=== 20. SEARCH ===');
  const srch = await call('GET', '/search/vendors', { token, params: { city: 'Kolkata', category: 'PHOTOGRAPHY', limit: 5 } });
  expect('search vendors 200', srch.status === 200, srch.body);

  console.log('\n=== 21. NOTIFICATIONS ===');
  const notif = await call('GET', '/notifications', { token });
  expect('notifications 200', notif.status === 200, notif.body);

  console.log('\n=== 22. IDENTITY ME ===');
  const me = await call('GET', '/identity/auth/me', { token });
  expect('me 200', me.status === 200, me.body);
  expect('me.email matches', me.body.data?.email === `${stamp}@test.com`);

  console.log('\n=== 23. EVENTS ===');
  const ev = await call('POST', '/events', {
    token,
    body: {
      customerId,
      organizationId,
      name: `${stamp} Wedding`,
      eventType: 'WEDDING',
      eventDate: '2026-12-12',
      venue: 'Grand Ballroom',
      city: 'Kolkata',
      guestCount: 200,
      isPublic: false,
    },
  });
  expect('event 201', ev.status === 201, ev.body);
  const eventId = ev.body.data?.eventId;

  const evSt = await call('PATCH', `/events/${eventId}/status`, {
    token,
    body: { status: 'CONFIRMED' },
  });
  expect('event confirm 200', evSt.status === 200, evSt.body);

  console.log('\n=== 24. REVIEWS ===');
  const rv = await call('POST', '/reviews', {
    token,
    body: {
      organizationId,
      bookingId,
      customerId,
      rating: 5,
      title: 'Outstanding',
      body: 'Excellent work!',
    },
  });
  expect('review 201', rv.status === 201, rv.body);

  const sum = await call('GET', `/reviews/summary/${organizationId}`, { token });
  expect('summary 200', sum.status === 200, sum.body);

  console.log('\n=== 25. ADMIN FLOW ===');
  // Register an admin via a second user, then promote role via Mongo
  const adminEmail = `${stamp}-admin@test.com`;
  const regAdmin = await call('POST', '/identity/auth/register', {
    body: { name: 'Admin User', email: adminEmail, password: 'Passw0rd!', role: 'CUSTOMER' },
  });
  expect('admin register 201', regAdmin.status === 201, regAdmin.body);
  const adminToken = regAdmin.body.data?.token;

  // Promote via direct DB write (admin promotion is internal-only)
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://starventkolkata_db_user:EKR718UuEMpsbiCZ@cluster0.jlbtdjj.mongodb.net/');
  await mongoose.connection.collection('users').updateOne(
    { email: adminEmail },
    { $set: { role: 'ADMIN' } },
  );
  await mongoose.disconnect();

  // Re-login to get a fresh token with ADMIN role
  const login = await call('POST', '/identity/auth/login', {
    body: { email: adminEmail, password: 'Passw0rd!' },
  });
  expect('admin login 200', login.status === 200, login.body);
  const adminAuth = login.body.data?.token;

  const obs = await call('GET', '/outbox/stats', { token: adminAuth });
  expect('outbox stats 200 for admin', obs.status === 200, obs.body);
  console.log('  outbox stats:', JSON.stringify(obs.body.data));

  const obsList = await call('GET', '/outbox?limit=20', { token: adminAuth });
  expect('outbox list 200 for admin', obsList.status === 200, obsList.body);
  console.log('  outbox events:', obsList.body.data?.length);

  const autoStats = await call('GET', '/automation/stats', { token: adminAuth });
  expect('automation stats 200 for admin', autoStats.status === 200, autoStats.body);
  console.log('  automation stats:', JSON.stringify(autoStats.body.data));

  const analytics = await call('GET', '/analytics/overview', { token: adminAuth });
  expect('analytics overview 200 for admin', analytics.status === 200, analytics.body);

  const custList = await call('GET', '/customers?limit=5', { token: adminAuth });
  expect('customers list 200', custList.status === 200, custList.body);

  const inqList = await call('GET', '/inquiries?limit=5', { token: adminAuth });
  expect('inquiries list 200', inqList.status === 200, inq.body);

  const audAll = await call('GET', '/audit/recent?limit=10', { token: adminAuth });
  expect('audit recent 200', audAll.status === 200, audAll.body);

  console.log('\n=== E2E COMPLETE ===');
  console.log('exitCode =', process.exitCode || 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
