require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config');
const outbox = require('./modules/outbox');
const analytics = require('./modules/analytics');
const followups = require('./modules/followups');

let workerTimer = null;
let analyticsTimer = null;
let followupTimer = null;

async function startWorker() {
  console.log('[server] Outbox worker started');
  const tick = async () => {
    try {
      const processed = await outbox.worker.tick({ batchSize: 25 });
      if (processed > 0) {
        console.log(`[server] Outbox worker processed ${processed} events`);
      }
    } catch (err) {
      console.error('[server] Outbox worker error:', err.message);
    } finally {
      workerTimer = setTimeout(tick, 2000);
    }
  };
  workerTimer = setTimeout(tick, 2000);
}

async function startAnalyticsScheduler() {
  console.log('[server] Analytics intent-score scheduler started');
  const tick = async () => {
    try {
      const updated = await analytics.service.recomputeAllIntents();
      if (updated > 0) {
        console.log(`[server] Analytics: recomputed ${updated} intent scores`);
      }
    } catch (err) {
      console.error('[server] Analytics scheduler error:', err.message);
    } finally {
      analyticsTimer = setTimeout(tick, 5 * 60 * 1000); // every 5 min
    }
  };
  analyticsTimer = setTimeout(tick, 30 * 1000); // first run after 30s
}

async function startFollowupScheduler() {
  console.log('[server] Follow-up overdue scheduler started');
  const tick = async () => {
    try {
      const result = await followups.service.processOverdue();
      if (result && result.processed > 0) {
        console.log(`[server] Follow-ups: processed ${result.processed} overdue`);
      }
    } catch (err) {
      console.error('[server] Follow-up scheduler error:', err.message);
    } finally {
      followupTimer = setTimeout(tick, 60 * 1000); // every minute
    }
  };
  followupTimer = setTimeout(tick, 15 * 1000); // first run after 15s
}

async function start() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`[server] StarVnt Core API listening on http://localhost:${port}`);
      console.log(`[server] Health check: http://localhost:${port}/api/health`);
    });
    startWorker();
    startAnalyticsScheduler();
    startFollowupScheduler();
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection:', reason);
});

process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received, shutting down');
  if (workerTimer) clearTimeout(workerTimer);
  if (analyticsTimer) clearTimeout(analyticsTimer);
  if (followupTimer) clearTimeout(followupTimer);
  process.exit(0);
});
