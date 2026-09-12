import { api } from './client';
import type { PublicTicketType } from './events';

export interface TicketType extends PublicTicketType {
  eventId: string;
  attendeeType?: string;
  salesStartDate?: string | null;
  salesEndDate?: string | null;
}

export interface CreateTicketTypeRequest {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  quantity?: number;
  maxPerOrder?: number;
  minPerOrder?: number;
  isVisible?: boolean;
}

export const ticketTypesApi = {
  list: (eventId: string) => api.get<TicketType[]>(`/events/${eventId}/ticket-types`),
  create: (eventId: string, data: CreateTicketTypeRequest) =>
    api.post<TicketType>(`/events/${eventId}/ticket-types`, data),
  update: (eventId: string, id: string, data: Partial<CreateTicketTypeRequest>) =>
    api.put<TicketType>(`/events/${eventId}/ticket-types/${id}`, data),
  delete: (eventId: string, id: string) =>
    api.delete<void>(`/events/${eventId}/ticket-types/${id}`),
};
