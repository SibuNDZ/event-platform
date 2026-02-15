import { api } from './client';

export interface Attendee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  eventId: string;
  ticketTypeId: string;
  ticketType?: {
    id: string;
    name: string;
    price: number;
  };
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN';
  checkedInAt?: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendeesResponse {
  attendees: Attendee[];
  total: number;
  page: number;
  limit: number;
}

export interface AttendeeQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const attendeesApi = {
  getByEvent: (eventId: string, params?: AttendeeQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return api.get<AttendeesResponse>(`/events/${eventId}/attendees${query ? `?${query}` : ''}`);
  },

  getById: (eventId: string, id: string) => api.get<Attendee>(`/events/${eventId}/attendees/${id}`),

  update: (eventId: string, id: string, data: Partial<Attendee>) =>
    api.put<Attendee>(`/events/${eventId}/attendees/${id}`, data),
};
