/**
 * Available API scopes for external integrations
 */
export const API_SCOPES = {
  // Event scopes
  READ_EVENTS: 'read:events',
  WRITE_EVENTS: 'write:events',

  // Attendee scopes
  READ_ATTENDEES: 'read:attendees',
  WRITE_ATTENDEES: 'write:attendees',

  // Ticket scopes
  READ_TICKETS: 'read:tickets',
  WRITE_TICKETS: 'write:tickets',

  // Order scopes
  READ_ORDERS: 'read:orders',

  // Check-in scopes
  READ_CHECKINS: 'read:checkins',
  WRITE_CHECKINS: 'write:checkins',

  // Analytics scopes
  READ_ANALYTICS: 'read:analytics',

  // Session scopes
  READ_SESSIONS: 'read:sessions',
  WRITE_SESSIONS: 'write:sessions',

  // Webhook management
  READ_WEBHOOKS: 'read:webhooks',
  WRITE_WEBHOOKS: 'write:webhooks',
} as const;

export type ApiScope = (typeof API_SCOPES)[keyof typeof API_SCOPES];

export const ALL_API_SCOPES = Object.values(API_SCOPES);

/**
 * Scope categories for documentation/UI
 */
export const SCOPE_CATEGORIES = {
  Events: [API_SCOPES.READ_EVENTS, API_SCOPES.WRITE_EVENTS],
  Attendees: [API_SCOPES.READ_ATTENDEES, API_SCOPES.WRITE_ATTENDEES],
  Tickets: [API_SCOPES.READ_TICKETS, API_SCOPES.WRITE_TICKETS],
  Orders: [API_SCOPES.READ_ORDERS],
  'Check-ins': [API_SCOPES.READ_CHECKINS, API_SCOPES.WRITE_CHECKINS],
  Analytics: [API_SCOPES.READ_ANALYTICS],
  Sessions: [API_SCOPES.READ_SESSIONS, API_SCOPES.WRITE_SESSIONS],
  Webhooks: [API_SCOPES.READ_WEBHOOKS, API_SCOPES.WRITE_WEBHOOKS],
};

/**
 * Scope descriptions
 */
export const SCOPE_DESCRIPTIONS: Record<ApiScope, string> = {
  'read:events': 'View event details, schedules, and settings',
  'write:events': 'Create and update events',
  'read:attendees': 'View attendee information and registration data',
  'write:attendees': 'Create and update attendee records',
  'read:tickets': 'View ticket information',
  'write:tickets': 'Create, transfer, and cancel tickets',
  'read:orders': 'View order and payment information',
  'read:checkins': 'View check-in records and history',
  'write:checkins': 'Perform check-ins and reversals',
  'read:analytics': 'Access event analytics and reports',
  'read:sessions': 'View session schedules and details',
  'write:sessions': 'Create and manage sessions',
  'read:webhooks': 'View webhook configurations',
  'write:webhooks': 'Create and manage webhooks',
};

/**
 * Default CRM integration scopes
 */
export const CRM_DEFAULT_SCOPES: ApiScope[] = [
  API_SCOPES.READ_EVENTS,
  API_SCOPES.READ_ATTENDEES,
  API_SCOPES.WRITE_ATTENDEES,
  API_SCOPES.READ_TICKETS,
  API_SCOPES.READ_CHECKINS,
];
