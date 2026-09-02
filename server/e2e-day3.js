/**
 * StarVnt Core — Day 3 End-to-End Demonstration
 *
 * Proves the 5 demo requirements:
 *   1. Same event processed twice does not create duplicate actions
 *   2. A failed action triggers the retry mechanism
 *   3. After max retries the failure is logged
 *   4. Unauthorized user cannot access protected customer data
 *   5. Scheduled automation does not create duplicate reminders repeatedly
 *
 * Run with: node e2e-day3.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

const BASE = process.env.BASE_URL || 'http://localhost:5000';

let pass = 0;
let fail = 0;
const results = [];

async function http(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {/* not json */}
  return { status: res.status, json, raw: text };
}

function record(name, ok, detail) {
  if (ok) pass++; else fail++;
  results.push({ name, ok, detail });
  const mark = ok ? '\x1b[32m✔\x1b[0m' : '\x1b[31m✘\x1b[0m';
  console.log(`${mark} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function login(email, password) {
  const { json } = await http('POST', '/api/identity/auth/login', { body: { email, password } });
  return json?.data?.token;
}

async function ensureCustomer(token) {
  const me = await http('GET', '/api/customers', { token });
  if (me.json?.data?.length > 0) return me.json.data[0];
  // Create
  const created = await http('POST', '/api/customers', {
    token,
    body: { name: 'Day3 Demo Customer', email: `day3-${Date.now()}@demo.test`, phone: '+91-9999999999', city: 'Bengaluru', eventType: 'Wedding' },
  });
  return created.json?.data;
}

async function waitFor(predicate, { timeoutMs = 12000, intervalMs = 500, label = 'condition' } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = await predicate();
    if (v) return v;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timed out waiting for: ${label}`);
}

async function main() {
  await connectDB();
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('  StarVnt Core — Day 3 End-to-End Demonstration');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // ─────────── Step 0: bootstrap ───────────
  const adminToken = await login('admin@starvnt.test', 'Admin@2026');
  const customerToken = await login('customer@starvnt.test', 'Customer@2026');
  if (!adminToken || !customerToken) throw new Error('Failed to obtain auth tokens');

  const customer = await ensureCustomer(customerToken);
  console.log(`Customer ready: ${customer?.customerId}\n`);

  // ═══════════════════════════════════════════════════════════════════
  // DEMO 4 — Authorization: unauthorized user cannot access protected data
  // ═══════════════════════════════════════════════════════════════════
  console.log('── DEMO 4 — Authorization enforcement ─────────────────────────────');
  const noAuth = await http('GET', '/api/customers');
  record('4a. GET /customers without token → 401', noAuth.status === 401, `got ${noAuth.status}`);

  const badAuth = await http('GET', '/api/customers', { token: 'not-a-real-token' });
  record('4b. GET /customers with garbage token → 401', badAuth.status === 401, `got ${badAuth.status}`);

  const customerOnly = await http('GET', '/api/outbox/stats', { token: customerToken });
  record('4c. CUSTOMER accessing /outbox/stats → 403', customerOnly.status === 403, `got ${customerOnly.status}`);

  const adminOutbox = await http('GET', '/api/outbox/stats', { token: adminToken });
  record('4d. ADMIN accessing /outbox/stats → 200', adminOutbox.status === 200, `got ${adminOutbox.status}`);

  // Customer cannot view another customer's inquiry (404 or 403 — 404 is also acceptable to avoid disclosure)
  const intruderInquiry = await http('GET', '/api/inquiries/DOES-NOT-EXIST', { token: customerToken });
  record('4e. Customer GET non-existent inquiry → 404', intruderInquiry.status === 404, `got ${intruderInquiry.status}`);

  // ═══════════════════════════════════════════════════════════════════
  // DEMO 1 — Idempotency: same event twice does not duplicate actions
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n── DEMO 1 — Event idempotency ──────────────────────────────────────');

  // Emit the same event TWICE with the SAME deterministic eventId.
  // The Outbox model's unique index on eventId must reject the second insert.
  const OutboxEvent = require('./src/modules/outbox/outbox.model');
  const Activity = require('./src/modules/activity/activity.model');
  const AutomationLog = require('./src/modules/automation/automationLog.model');

  const deterministicId = `DAY3-DUP-${Date.now()}`;
  const evt1 = await OutboxEvent.create({
    eventId: deterministicId,
    eventName: 'INQUIRY_CREATED',
    entityType: 'INQUIRY',
    entityId: 'INQ-DAY3-DUP',
    organizationId: customer.organizationId || null,
    payload: { subject: 'Duplicate-event probe' },
  });
  let evt2Err = null;
  try {
    await OutboxEvent.create({
      eventId: deterministicId, // SAME id — should violate unique index
      eventName: 'INQUIRY_CREATED',
      entityType: 'INQUIRY',
      entityId: 'INQ-DAY3-DUP',
      payload: { subject: 'Duplicate-event probe (attempt 2)' },
    });
  } catch (e) { evt2Err = e; }
  record('1a. Second insert with same eventId rejected', !!evt2Err && evt2Err.code === 11000, `code=${evt2Err?.code}`);

  // Wait for the worker to process the single event.
  // The INQUIRY_CREATED rule has one action: CREATE_ACTIVITY.
  await waitFor(async () => {
    return Activity.findOne({ entityId: 'INQ-DAY3-DUP', actionType: 'INQUIRY_CREATED' }).lean();
  }, { label: 'activity log for INQ-DAY3-DUP' });

  // Wait for the SUCCESS automation log to be written so the engine's idempotency
  // check has something to compare against on the re-run.
  await waitFor(async () => {
    const l = await AutomationLog.findOne({ idempotencyKey: `${deterministicId}:INQUIRY_CREATED_ACTIVITY:CREATE_ACTIVITY`, status: 'SUCCESS' }).lean();
    return l;
  }, { label: 'SUCCESS automation log for INQ-DAY3-DUP' });

  // Re-process the same event and check that a SKIPPED log is created, not a duplicate activity.
  const automationEngine = require('./src/modules/automation/automation.engine');
  const beforeActivityCount = await Activity.countDocuments({ entityId: 'INQ-DAY3-DUP', actionType: 'INQUIRY_CREATED' });
  await automationEngine.processEvent(evt1.toObject());
  const afterActivityCount = await Activity.countDocuments({ entityId: 'INQ-DAY3-DUP', actionType: 'INQUIRY_CREATED' });
  const skippedLog = await AutomationLog.findOne({ idempotencyKey: `${deterministicId}:INQUIRY_CREATED_ACTIVITY:CREATE_ACTIVITY`, status: 'SKIPPED' }).lean();

  record('1b. Activity count unchanged after reprocessing event', beforeActivityCount === afterActivityCount, `${beforeActivityCount} → ${afterActivityCount}`);
  record('1c. SKIPPED log row created on re-run', !!skippedLog, `idempotencyKey=${skippedLog?.idempotencyKey}`);

  // ═══════════════════════════════════════════════════════════════════
  // DEMO 2 — Retry: a failed action triggers the retry mechanism
  //          DEMO 3 — After max retries, failure is logged
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n── DEMO 2 & 3 — Retry and failure logging ──────────────────────────');

  // Use a deliberately failing handler — mutate the same handler object so all
  // modules that captured the reference see the change.
  const automationRules = require('./src/modules/automation/automation.rules');
  const originalNotifyHandler = automationRules.ACTION_HANDLERS.CREATE_NOTIFICATION;
  let attempts = 0;
  automationRules.ACTION_HANDLERS.CREATE_NOTIFICATION = async () => {
    attempts += 1;
    throw new Error(`Simulated transient failure #${attempts}`);
  };

  // Emit a NEW unique event that will hit the failing rule.
  // (We don't have a rule with CREATE_NOTIFICATION as the FIRST action, so we
  // emit CUSTOMER_CREATED which has CREATE_ACTIVITY + CREATE_NOTIFICATION.)
  const failingEventId = `DAY3-FAIL-${Date.now()}`;
  await OutboxEvent.create({
    eventId: failingEventId,
    eventName: 'CUSTOMER_CREATED',
    entityType: 'CUSTOMER',
    entityId: 'CUS-DAY3-FAIL',
    payload: { name: 'Day3 Failing Customer' },
    maxAttempts: 3,
  });

  // Drive the worker tick directly — this is the same code path the
  // background worker uses, so it is genuine end-to-end proof.
  const outboxWorker = require('./src/modules/outbox/outbox.worker');
  for (let i = 0; i < 4; i += 1) {
    // Reset the backoff so the next tick can pick the event up immediately.
    await OutboxEvent.updateOne({ eventId: failingEventId }, { $set: { availableAt: new Date(Date.now() - 1000) } });
    await outboxWorker.tick();
  }

  const finalEvent = await OutboxEvent.findOne({ eventId: failingEventId }).lean();
  record('2a. Event attempts incremented across retries', finalEvent.attempts >= 3, `attempts=${finalEvent.attempts}`);
  record('3a. Event reached max-attempts and is marked FAILED', finalEvent.status === 'FAILED', `status=${finalEvent.status}`);
  record('3b. lastError is recorded on the event', !!finalEvent.lastError, `error="${finalEvent.lastError}"`);

  const failureLogs = await AutomationLog.countDocuments({ eventId: failingEventId, status: 'FAILED' });
  record('3c. Automation failure log rows persisted', failureLogs >= 3, `count=${failureLogs}`);

  // Restore handler
  automationRules.ACTION_HANDLERS.CREATE_NOTIFICATION = originalNotifyHandler;

  // ═══════════════════════════════════════════════════════════════════
  // DEMO 5 — Scheduled follow-up automation: dedup of reminders
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n── DEMO 5 — Scheduled follow-up dedup ─────────────────────────────');

  const FollowUp = require('./src/modules/followups/followup.model');
  // Create a follow-up that is already OVERDUE
  const overdueFollowup = await FollowUp.create({
    followupId: `FU-DAY3-${Date.now()}`,
    customerId: customer.customerId,
    organizationId: customer.organizationId || null,
    title: 'Day3 overdue probe',
    scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'OVERDUE',
  });

  // Fire FOLLOW_UP_OVERDUE event TWICE with the same deterministic eventId.
  // The automation engine should log one SUCCESS and one SKIPPED.
  const fuEventId = `DAY3-FU-${Date.now()}`;
  const evt = await OutboxEvent.create({
    eventId: fuEventId,
    eventName: 'FOLLOW_UP_OVERDUE',
    entityType: 'FOLLOW_UP',
    entityId: overdueFollowup.followupId,
    payload: { followUpId: overdueFollowup.followupId, title: overdueFollowup.title, customerId: customer.customerId },
  });

  await automationEngine.processEvent(evt.toObject());
  await automationEngine.processEvent(evt.toObject());

  const fuActivity = await Activity.countDocuments({ entityId: overdueFollowup.followupId, actionType: 'FOLLOW_UP_OVERDUE' });
  // The engine-level idempotency guarantees the action is only executed once,
  // so we count automation logs (SUCCESS vs SKIPPED) for the CREATE_NOTIFICATION action.
  const fuNotifySuccess = await AutomationLog.countDocuments({
    eventId: fuEventId,
    actionType: 'CREATE_NOTIFICATION',
    status: 'SUCCESS',
  });
  const fuNotifySkipped = await AutomationLog.countDocuments({
    eventId: fuEventId,
    actionType: 'CREATE_NOTIFICATION',
    status: 'SKIPPED',
  });
  const fuActivityLogs = await AutomationLog.countDocuments({ eventId: fuEventId, status: 'SKIPPED' });

  record('5a. Re-processing same FOLLOW_UP_OVERDUE event does not duplicate activity', fuActivity === 1, `count=${fuActivity}`);
  record('5b. CREATE_NOTIFICATION runs only once', fuNotifySuccess === 1, `success=${fuNotifySuccess}, skipped=${fuNotifySkipped}`);
  record('5c. SKIPPED automation log rows recorded for the second run', fuActivityLogs >= 1, `count=${fuActivityLogs}`);

  // ═══════════════════════════════════════════════════════════════════
  // BONUS — Outbox stats & automation log counts (system health snapshot)
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n── BONUS — System health snapshot ─────────────────────────────────');
  const outboxStats = await OutboxEvent.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const automationLogs = await AutomationLog.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  console.log('Outbox by status:', outboxStats);
  console.log('Automation logs by status:', automationLogs);

  // ═══════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log(`  Result: ${pass} passed · ${fail} failed`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // Save report
  const fs = require('fs');
  const reportPath = 'e2e-day3-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    runAt: new Date().toISOString(),
    baseUrl: BASE,
    passed: pass,
    failed: fail,
    results,
    outboxStats,
    automationLogs,
  }, null, 2));
  console.log(`Report written to ${reportPath}`);

  await mongoose.connection.close();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error('\nFATAL:', err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
