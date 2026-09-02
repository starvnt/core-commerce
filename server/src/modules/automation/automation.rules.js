/**
 * Automation rule definitions.
 *
 * Each rule has:
 *   ruleId      — stable identifier
 *   name        — human readable
 *   triggerEvent — event name that activates the rule
 *   conditions  — pure function (event, ctx) => boolean
 *   actions     — list of action descriptors to execute when matched
 *
 * The engine is deterministic, audit-traced and idempotent.
 */
const activity = require('../activity/activity.service');
const followups = require('../followups/followups.service');
const notifications = require('../notifications/notifications.service');

const RULES = [
  {
    ruleId: 'CUSTOMER_CREATED_ACTIVITY',
    name: 'Log activity when a customer is created',
    triggerEvent: 'CUSTOMER_CREATED',
    conditions: () => true,
    actions: [
      {
        type: 'CREATE_ACTIVITY',
        build: (event) => ({
          entityType: 'CUSTOMER',
          entityId: event.entityId,
          actionType: 'CUSTOMER_CREATED',
          message: `Customer created: ${event.payload?.name || event.entityId}`,
          source: 'AUTOMATION',
          organizationId: event.organizationId,
        }),
      },
      {
        type: 'CREATE_NOTIFICATION',
        build: (event) => ({
          recipientRole: 'ADMIN',
          organizationId: event.organizationId,
          title: 'New customer',
          message: `${event.payload?.name || 'A new customer'} was added.`,
          link: `/customers/${event.entityId}`,
        }),
      },
    ],
  },
  {
    ruleId: 'INQUIRY_CREATED_ACTIVITY',
    name: 'Log activity when an inquiry is created',
    triggerEvent: 'INQUIRY_CREATED',
    conditions: () => true,
    actions: [
      {
        type: 'CREATE_ACTIVITY',
        build: (event) => ({
          entityType: 'INQUIRY',
          entityId: event.entityId,
          actionType: 'INQUIRY_CREATED',
          message: `New inquiry: ${event.payload?.title || event.entityId}`,
          source: 'AUTOMATION',
          organizationId: event.organizationId,
        }),
      },
    ],
  },
  {
    ruleId: 'QUOTE_SENT_NOTIFY_CUSTOMER',
    name: 'Notify customer when a quote is sent',
    triggerEvent: 'QUOTE_SENT',
    conditions: () => true,
    actions: [
      {
        type: 'CREATE_ACTIVITY',
        build: (event) => ({
          entityType: 'QUOTE',
          entityId: event.entityId,
          actionType: 'QUOTE_SENT',
          message: 'Quote sent to customer',
          source: 'AUTOMATION',
          organizationId: event.organizationId,
        }),
      },
    ],
  },
  {
    ruleId: 'BOOKING_CONFIRMED_ACTIVITY',
    name: 'Log activity when a booking is confirmed',
    triggerEvent: 'BOOKING_CONFIRMED',
    conditions: () => true,
    actions: [
      {
        type: 'CREATE_ACTIVITY',
        build: (event) => ({
          entityType: 'BOOKING',
          entityId: event.entityId,
          actionType: 'BOOKING_CONFIRMED',
          message: 'Booking confirmed',
          source: 'AUTOMATION',
          organizationId: event.organizationId,
        }),
      },
    ],
  },
  {
    ruleId: 'FOLLOW_UP_OVERDUE_ALERT',
    name: 'Mark follow-up overdue and emit alert',
    triggerEvent: 'FOLLOW_UP_OVERDUE',
    conditions: (event) => event.payload?.followUpId,
    actions: [
      {
        type: 'CREATE_ACTIVITY',
        build: (event) => ({
          entityType: 'FOLLOW_UP',
          entityId: event.payload.followUpId,
          actionType: 'FOLLOW_UP_OVERDUE',
          message: 'Follow-up marked overdue',
          source: 'AUTOMATION',
          organizationId: event.organizationId,
        }),
      },
      {
        type: 'CREATE_NOTIFICATION',
        build: (event) => ({
          recipientRole: 'ADMIN',
          organizationId: event.organizationId,
          title: 'Follow-up overdue',
          message: event.payload?.title || 'A follow-up is overdue.',
          link: `/customers/${event.payload?.customerId || ''}`,
        }),
      },
    ],
  },
];

function getRules() {
  return RULES;
}

function findRulesForEvent(eventName) {
  return RULES.filter((r) => r.triggerEvent === eventName);
}

const ACTION_HANDLERS = {
  CREATE_ACTIVITY: async (params) => activity.log(params),
  CREATE_NOTIFICATION: async (params) => notifications.create(params),
  CREATE_FOLLOW_UP: async (params) => followups.create(params),
  UPDATE_STATUS: async () => null, // placeholder
};

module.exports = { getRules, findRulesForEvent, ACTION_HANDLERS };
