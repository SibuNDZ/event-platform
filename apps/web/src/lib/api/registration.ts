import { api } from './client';

export interface RegisterAttendee {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
}

export interface RegisterRequest {
  ticketTypeId: string;
  attendees: RegisterAttendee[];
}

export interface RegistrationTicket {
  id: string;
  ticketNumber: string;
  qrCode: string;
}

export interface RegistrationResult {
  status: 'completed' | 'requires_payment' | 'pending';
  orderId: string;
  orderNumber: string;
  checkoutUrl?: string | null;
  event?: {
    id: string;
    name: string;
    slug: string;
    startDate: string;
    venueName?: string | null;
  };
  tickets?: RegistrationTicket[];
}

export const registrationApi = {
  register: (eventId: string, data: RegisterRequest) =>
    api.post<RegistrationResult>(`/events/${eventId}/register`, data, { skipAuth: true }),

  getOrder: (orderId: string) =>
    api.get<RegistrationResult>(`/orders/${orderId}`, { skipAuth: true }),

  getCheckoutStatus: (sessionId: string) =>
    api.get<RegistrationResult>(`/payments/checkout/${sessionId}`, { skipAuth: true }),
};
