const { v4: uuidv4 } = require('uuid');
const AutomationLog = require('./automationLog.model');
const { findRulesForEvent, ACTION_HANDLERS } = require('./automation.rules');

/**
 * Process a single outbox event through the automation engine.
 * For each matching rule, evaluate conditions and execute actions.
 * Idempotent: uses eventId + ruleId + actionType as the dedup key.
 */
async function processEvent(event) {
  const rules = findRulesForEvent(event.eventName);
  for (const rule of rules) {
    try {
      const matched = rule.conditions ? rule.conditions(event) : true;
      if (!matched) continue;
      for (const action of rule.actions) {
        const idempotencyKey = `${event.eventId}:${rule.ruleId}:${action.type}`;
        const existing = await AutomationLog.findOne({ idempotencyKey, status: 'SUCCESS' });
        if (existing) {
          await AutomationLog.create({
            automationLogId: `ALOG-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`,
            eventId: event.eventId,
            ruleId: rule.ruleId,
            ruleName: rule.name,
            entityType: event.entityType,
            entityId: event.entityId,
            actionType: action.type,
            status: 'SKIPPED',
            attempt: event.attempts || 1,
            idempotencyKey,
            metadata: { reason: 'already_processed' },
            completedAt: new Date(),
          });
          continue;
        }
        const params = action.build(event);
        const handler = ACTION_HANDLERS[action.type];
        if (!handler) {
          await logExecution(event, rule, action, idempotencyKey, 'FAILED', 'No handler registered');
          continue;
        }
        try {
          await handler(params);
          await logExecution(event, rule, action, idempotencyKey, 'SUCCESS', null);
        } catch (err) {
          await logExecution(event, rule, action, idempotencyKey, 'FAILED', err.message);
          throw err; // bubble up so the worker schedules retry
        }
      }
    } catch (err) {
      console.error(`[automation] rule ${rule.ruleId} failed:`, err.message);
      throw err;
    }
  }
}

async function logExecution(event, rule, action, idempotencyKey, status, error) {
  await AutomationLog.create({
    automationLogId: `ALOG-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`,
    eventId: event.eventId,
    ruleId: rule.ruleId,
    ruleName: rule.name,
    entityType: event.entityType,
    entityId: event.entityId,
    actionType: action.type,
    status,
    attempt: event.attempts || 1,
    idempotencyKey,
    error,
    metadata: { payload: event.payload },
    completedAt: new Date(),
  });
}

async function getRecentLogs({ limit = 50, organizationId = null } = {}) {
  return AutomationLog.find({}).sort({ createdAt: -1 }).limit(Math.min(limit, 200));
}

async function getStats() {
  const [success, failed, skipped] = await Promise.all([
    AutomationLog.countDocuments({ status: 'SUCCESS' }),
    AutomationLog.countDocuments({ status: 'FAILED' }),
    AutomationLog.countDocuments({ status: 'SKIPPED' }),
  ]);
  return { success, failed, skipped, total: success + failed + skipped };
}

module.exports = { processEvent, getRecentLogs, getStats };
