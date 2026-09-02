const outbox = require('./outbox.service');
const automation = require('../automation/automation.engine');

let isRunning = false;
let intervalHandle = null;

/**
 * Worker tick — fetches pending events, marks them processing, runs them
 * through the automation engine, then records success or schedules retry.
 * This is the v1 reliability layer.
 */
async function tick() {
  if (isRunning) return;
  isRunning = true;
  try {
    const events = await outbox.listPending(10);
    for (const evt of events) {
      try {
        const locked = await outbox.markProcessing(evt.eventId);
        if (!locked) continue;
        await automation.processEvent(locked);
        await outbox.markProcessed(locked.eventId);
      } catch (err) {
        console.error(`[worker] event ${evt.eventId} failed:`, err.message);
        await outbox.markFailed(evt.eventId, err);
      }
    }
  } catch (err) {
    console.error('[worker] tick error:', err.message);
  } finally {
    isRunning = false;
  }
}

function start({ intervalMs = 3000 } = {}) {
  if (intervalHandle) return;
  intervalHandle = setInterval(tick, intervalMs);
  // Run one tick immediately so events don't wait for the first interval.
  setImmediate(tick);
  console.log(`[worker] Outbox worker started (interval ${intervalMs}ms)`);
}

function stop() {
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = null;
}

module.exports = { start, stop, tick };
