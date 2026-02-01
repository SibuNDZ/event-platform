export const QUEUE_CONNECTION = 'QUEUE_CONNECTION';

export const QUEUES = {
  EMAIL: 'email',
  PDF: 'pdf-generation',
  TICKET: 'ticket-processing',
  WEBHOOK: 'webhook-delivery',
  ANALYTICS: 'analytics',
  NOTIFICATION: 'notification',
} as const;
