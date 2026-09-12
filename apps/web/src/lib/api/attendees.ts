import { api } from './client';

export interface AttendeeTicket {
  id: string;
  ticketNumber: string;
  qrCode: string;
  status: string;
  ticketType?: {
    id: string;
    name: string;
    price: string | number;
  };
}

export interface Attendee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  tickets?: AttendeeTicket[];
  checkIns?: { id: string; checkedInAt: string }[];
}

export interface AttendeesResponse {
  items: Attendee[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface AttendeeQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export function getAttendeeStatus(attendee: Attendee): 'CHECKED_IN' | 'CONFIRMED' {
  return attendee.checkIns && attendee.checkIns.length > 0 ? 'CHECKED_IN' : 'CONFIRMED';
}

export const attendeesApi = {
  getByEvent: (eventId: string, params?: AttendeeQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.perPage) searchParams.set('perPage', params.perPage.toString());
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return api.get<AttendeesResponse>(`/events/${eventId}/attendees${query ? `?${query}` : ''}`);
  },

  getById: (eventId: string, id: string) => api.get<Attendee>(`/events/${eventId}/attendees/${id}`),

  update: (eventId: string, id: string, data: Partial<Attendee>) =>
    api.put<Attendee>(`/events/${eventId}/attendees/${id}`, data),
};
