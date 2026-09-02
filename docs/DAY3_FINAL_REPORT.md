# StarVnt Core — Day 3 Final Report

**Date:** 2026-09-02 / 2026-09-03
**Theme:** Connect → Prove Reliability → Recover from Failure

---

## Repository

| Field         | Value |
|---------------|-------|
| Repository    | `StarVNT/core-commerce` (local path: `C:\Users\Keshab Das\Desktop\Personal Projects\StarVNT\core-commerce`) |
| Branch        | `main` |
| Latest commit | `417dc76` — _Day 3: premium UI, seed users, end-to-end reliability demo_ |
| Previous SHA  | `d59368a` — _first commit_ |

---

## Working APIs (smoke-tested live)

| Module            | Endpoint(s)                                                          | Status |
|-------------------|----------------------------------------------------------------------|--------|
| Health            | `GET  /api/health`                                                   | ✔ 200 |
| Identity          | `POST /api/identity/auth/register` · `/login` · `GET /auth/me`       | ✔ verified |
| Customers         | `POST/GET/PUT/DELETE /api/customers` · `GET /by-user/:userId`        | ✔ verified |
| Outbox            | `GET /api/outbox` · `/stats` · `/:eventId` · `POST /:eventId/retry` | ✔ verified |
| Automation        | `GET /api/automation/rules` · `/logs` · `/stats`                     | ✔ verified |
| Audit             | `GET /api/audit/recent` · `/entity/:type/:id` · `?…`                 | ✔ verified |
| Inquiries         | full CRUD + `/transition` + `/respond`                               | ✔ verified |
| Quotes / Bookings | full CRUD + status transitions + acceptance / rejection             | ✔ verified |
| Follow-ups        | full CRUD + scheduler (every 60 s)                                   | ✔ (worker tick verified — `processOverdue` is **not** exported; see Blockers) |
| Notifications     | `GET /notifications/unread-count` · `mark-read` · role-based fanout  | ✔ verified |

---

## Day 3 Checklist — status

| # | Item                                            | Status         | Evidence |
|---|-------------------------------------------------|----------------|----------|
| 1 | Persistent Event / Outbox                       | ✔ DONE         | `server/src/modules/outbox/outbox.model.js` (unique `eventId` index), `outbox.service.js` |
| 2 | Event Worker Processing                         | ✔ DONE         | `outbox.worker.js` + 2 s timer in `server.js:14-29`; live proof — 73 PROCESSED events in DB |
| 3 | Automation Rule → Condition → Action Flow       | ✔ DONE         | `automation.engine.js` + `automation.rules.js` (5 rules, 3 condition-gated actions) |
| 4 | Idempotency & Duplicate Prevention              | ✔ DONE         | DB-level (unique `eventId`) + engine-level (`idempotencyKey = eventId:ruleId:actionType`); demo 1 |
| 5 | Retry & Failure Recovery                        | ✔ DONE         | `outbox.service.markFailed` exponential backoff (30 s / 2 min / 8 min); demo 2 |
| 6 | Reusable Activity Timeline                      | ✔ DONE         | `activity.service.log()` consumed by every automation rule + manual controller paths; surfaced in `MyWorkspace`, `InquiryDetail`, `QuoteDetail`, `BookingDetail` |
| 7 | Scheduled Automation Foundation                 | ⚠️ PARTIAL     | Server has 3 schedulers (worker / analytics / follow-up); **the follow-up scheduler calls `followups.service.processOverdue()` which is not exported — it logs `TypeError` every minute** — see Blockers |
| 8 | Authentication + Authorization Testing           | ✔ DONE         | `authRequired` + `requireRole` middleware; demo 4 (5/5 cases verified) |
| 9 | Input Validation + API Error Standards          | ⚠️ PARTIAL     | Centralized `errorHandler` returns `{ success, code, message, details? }`. Per-controller validation (Zod/Joi) is not yet standard — most modules rely on Mongoose's schema validation |
| 10 | Audit + Automation Logging                    | ✔ DONE         | `audit.service.record()` + `automationLog.model.js`; demo 1/3 produce SUCCESS / FAILED / SKIPPED rows |
| 11 | Health + Basic Observability                  | ✔ DONE         | `GET /api/health` returns `{ success, status, uptime, timestamp }`. /api/outbox/stats and /api/automation/stats provide operational counters |
| 12 | Real End-to-End Working Proof                  | ✔ DONE         | `server/e2e-day3.js` — 15/15 assertions pass against live server + MongoDB Atlas |

---

## Live Demonstrations

Script: `server/e2e-day3.js` (run with `node server/e2e-day3.js`).
Result JSON: `server/e2e-day3-report.json` — last run **15 passed · 0 failed**.

### Demo 1 — Same event processed twice (idempotency)
```
✔ 1a. Second insert with same eventId rejected — code=11000
✔ 1b. Activity count unchanged after reprocessing event — 4 → 4
✔ 1c. SKIPPED log row created on re-run — idempotencyKey=DAY3-DUP-…:INQUIRY_CREATED_ACTIVITY:CREATE_ACTIVITY
```

### Demo 2 — Retry on failure
```
✔ 2a. Event attempts incremented across retries — attempts=3
```

### Demo 3 — Max-retry logging
```
✔ 3a. Event reached max-attempts and is marked FAILED — status=FAILED
✔ 3b. lastError is recorded on the event — error="Simulated transient failure #3"
✔ 3c. Automation failure log rows persisted — count=3
```

### Demo 4 — Authorization enforcement
```
✔ 4a. GET /customers without token       → 401
✔ 4b. GET /customers with garbage token  → 401
✔ 4c. CUSTOMER accessing /outbox/stats   → 403
✔ 4d. ADMIN    accessing /outbox/stats   → 200
✔ 4e. Customer accessing non-existent inquiry → 404
```

### Demo 5 — Scheduled automation does not duplicate reminders
```
✔ 5a. Re-processing same FOLLOW_UP_OVERDUE event does not duplicate activity — count=1
✔ 5b. CREATE_NOTIFICATION runs only once — success=1, skipped=1
✔ 5c. SKIPPED automation log rows recorded for the second run — count=2
```

### Bonus — System health snapshot
```
Outbox by status:       PROCESSED 73 · PENDING 1 · FAILED 3
Automation logs:        SUCCESS 44 · FAILED 19 · SKIPPED 30
```

---

## Login credentials (seeded via `npm run seed`)

| Role     | Email                    | Password       |
|----------|--------------------------|----------------|
| Admin    | `admin@starvnt.test`     | `Admin@2026`   |
| Customer | `customer@starvnt.test`  | `Customer@2026`|
| Partner  | `partner@starvnt.test`   | `Partner@2026` |

Seeded organization: `Studio Aurora` (Mumbai, Photography + Cinematography, verified + featured).

---

## Working-proof artifacts

1. **`server/e2e-day3.js`** — single Node script that exercises the live API and direct DB writes to prove all 5 demo requirements.
2. **`server/e2e-day3-report.json`** — last run's pass/fail record with timings and counters.
3. **`server/e2e-smoke.js`** — earlier Day-1/2 25-section smoke test (still passes).
4. **Atlas cluster** — `ac-zartv65-shard-00-XX.jlbtdjj.mongodb.net/starvnt_core` with `customers`, `users`, `outboxevents`, `automationlogs`, `auditlogs`, `notifications`, `followups`, `activities`, `inquiries`, `quotes`, `bookings`, `payments`, `tasks`, `timeline`, `guests`, `budgets`, `documents`, `notes`, `messages`, `reviews`, `offerings`, `organizations` collections populated.

---

## Blockers / Known issues found by the audit

1. **`followups.service.processOverdue` is not exported.** `server.js:53` schedules `setInterval(() => followups.service.processOverdue(), 60_000)` but the service only exports `{ create, list, getById, update, markOverdue, remove }`. The scheduler logs `TypeError: followups.service.processOverdue is not a function` every minute. **Fix:** implement `processOverdue()` (find PENDING with `scheduledAt < now`, set status OVERDUE, emit `FOLLOW_UP_OVERDUE` event) and add it to `module.exports`.
2. **`outbox.controller.listPending` passes `{ limit }` but the service expects a positional number.** Current controller response always uses the default 25 because destructuring fails silently. **Fix:** either change the service signature or drop the wrapper object at the controller.
3. **`server.js` worker call passes `{ batchSize: 25 }` but `worker.tick()` reads no params.** Cosmetic — the worker pulls its own 10-event batch — but the message log is misleading. **Fix:** remove the param from `server.js`, or accept and use it in `tick()`.
4. **Notification action in `FOLLOW_UP_OVERDUE` rule does not pass `followupId` in metadata.** Limits future DB-level notification dedup. **Fix:** add `metadata: { followUpId: event.payload.followUpId, customerId: event.payload.customerId }` to the `CREATE_NOTIFICATION` build in `automation.rules.js`.
5. **Input validation is partial.** Centralized error envelope is in place, but Zod/Joi schemas are not yet applied per controller. Several endpoints will accept and silently coerce unexpected payloads (e.g., empty `lineItems` array gets default-filled by the service).
6. **Outbox model lacks a stale-PENDING watchdog.** If the worker crashes mid-tick after marking `PROCESSING` but before `PROCESSED`, the event is stuck. **Fix:** add a sweeper that resets `PROCESSING` rows older than N minutes back to `PENDING`.

---

## What changed in this commit (`417dc76`)

**Backend**
- `server/scripts/seed-users.js` — idempotent admin + customer + partner seeder; wired as `npm run seed`.
- `server/e2e-day3.js` + `server/e2e-day3-report.json` — live reliability demo (15/15 pass).

**Frontend (premium UI rebuild)**
- `client/index.html` — Tailwind CDN + custom theme config.
- `client/src/components/ui/*` — 12 hand-rolled shadcn-style primitives (Button, Card, Field, Badge, Tabs, Dialog, Skeleton, Avatar, Separator, Toast, StatTile, DataTable).
- `client/src/services/cn.js` — class-name combiner (no `clsx` dep).
- `client/src/components/AppShell.jsx` — grid shell with sidebar + topbar; bypasses chrome on `/login` `/signup` `/landing`.
- `client/src/components/auth/AuthShell.jsx` — split-screen layout (gradient mesh brand panel + form card).
- `client/src/pages/{Landing,Login,Signup,Home,MyWorkspace,InquiryDetail,QuoteDetail,BookingDetail,AdminDashboard,AdminList}.jsx` + `admin/{Automation,Outbox}.jsx` — full premium rewrites using the new primitives.

---

## How to reproduce

```bash
# Backend
cd server
npm install
npm run seed           # creates admin@/customer@/partner@ accounts
npm start              # API on :5000, worker + schedulers running

# In another shell — run the Day 3 demo
node e2e-day3.js       # 15/15 expected

# Frontend
cd ../client
npm install
npm run dev            # UI on :5173
```

Visit `http://localhost:5173/login` and sign in as `admin@starvnt.test / Admin@2026` to see the cockpit.
