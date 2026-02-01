/**
 * Webhook event types that organizations can subscribe to.
 * Format: resource.action
 */
export const WEBHOOK_EVENTS = {
  // Attendee events
  ATTENDEE_CREATED: 'attendee.created',
  ATTENDEE_UPDATED: 'attendee.updated',
  ATTENDEE_CANCELLED: 'attendee.cancelled',
  ATTENDEE_CHECKED_IN: 'attendee.checked_in',

  // Order events
  ORDER_CREATED: 'order.created',
  ORDER_COMPLETED: 'order.completed',
  ORDER_FAILED: 'order.failed',
  ORDER_REFUNDED: 'order.refunded',

  // Ticket events
  TICKET_CREATED: 'ticket.created',
  TICKET_TRANSFERRED: 'ticket.transferred',
  TICKET_CANCELLED: 'ticket.cancelled',

  // Event events
  EVENT_CREATED: 'event.created',
  EVENT_UPDATED: 'event.updated',
  EVENT_PUBLISHED: 'event.published',
  EVENT_CANCELLED: 'event.cancelled',

  // Check-in events
  CHECKIN_COMPLETED: 'checkin.completed',
  CHECKIN_REVERTED: 'checkin.reverted',

  // Session events
  SESSION_CHECKIN: 'session.checkin',

  // Test event
  TEST_PING: 'test.ping',
} as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[keyof typeof WEBHOOK_EVENTS];

export const ALL_WEBHOOK_EVENTS = Object.values(WEBHOOK_EVENTS);

/**
 * Categorized webhook events for documentation/UI
 */
export const WEBHOOK_EVENT_CATEGORIES = {
  Attendees: [
    WEBHOOK_EVENTS.ATTENDEE_CREATED,
    WEBHOOK_EVENTS.ATTENDEE_UPDATED,
    WEBHOOK_EVENTS.ATTENDEE_CANCELLED,
    WEBHOOK_EVENTS.ATTENDEE_CHECKED_IN,
  ],
  Orders: [
    WEBHOOK_EVENTS.ORDER_CREATED,
    WEBHOOK_EVENTS.ORDER_COMPLETED,
    WEBHOOK_EVENTS.ORDER_FAILED,
    WEBHOOK_EVENTS.ORDER_REFUNDED,
  ],
  Tickets: [
    WEBHOOK_EVENTS.TICKET_CREATED,
    WEBHOOK_EVENTS.TICKET_TRANSFERRED,
    WEBHOOK_EVENTS.TICKET_CANCELLED,
  ],
  Events: [
    WEBHOOK_EVENTS.EVENT_CREATED,
    WEBHOOK_EVENTS.EVENT_UPDATED,
    WEBHOOK_EVENTS.EVENT_PUBLISHED,
    WEBHOOK_EVENTS.EVENT_CANCELLED,
  ],
  CheckIn: [
    WEBHOOK_EVENTS.CHECKIN_COMPLETED,
    WEBHOOK_EVENTS.CHECKIN_REVERTED,
    WEBHOOK_EVENTS.SESSION_CHECKIN,
  ],
  Test: [WEBHOOK_EVENTS.TEST_PING],
};
