import { api } from './client';

export interface Event {
  id: string;
  name: string;
  slug: string;
  description?: string;
  startDate: string;
  endDate: string;
  timezone: string;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  isVirtual: boolean;
  virtualUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  coverImage?: string;
  maxAttendees?: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    attendees: number;
    ticketTypes: number;
  };
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}

export interface EventStats {
  totalAttendees: number;
  checkedIn: number;
  revenue: number;
  ticketsSold: number;
}

export interface CreateEventRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  timezone: string;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  isVirtual?: boolean;
  virtualUrl?: string;
  maxAttendees?: number;
}

export interface EventQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const eventsApi = {
  getAll: (params?: EventQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return api.get<EventsResponse>(`/events${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => api.get<Event>(`/events/${id}`),

  create: (data: CreateEventRequest) => api.post<Event>('/events', data),

  update: (id: string, data: Partial<CreateEventRequest>) =>
    api.put<Event>(`/events/${id}`, data),

  delete: (id: string) => api.delete<void>(`/events/${id}`),

  publish: (id: string) => api.post<Event>(`/events/${id}/publish`),

  unpublish: (id: string) => api.post<Event>(`/events/${id}/unpublish`),

  cancel: (id: string) => api.post<Event>(`/events/${id}/cancel`),

  duplicate: (id: string) => api.post<Event>(`/events/${id}/duplicate`),

  getStats: (id: string) => api.get<EventStats>(`/events/${id}/stats`),
};
