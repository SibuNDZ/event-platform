import { api } from './client';

export interface Event {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  type: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  startDate: string;
  endDate: string;
  timezone: string;
  venueName?: string | null;
  venueAddress?: string | null;
  venueCity?: string | null;
  venueCountry?: string | null;
  currency?: string;
  coverImageUrl?: string | null;
  maxAttendees?: number | null;
  isPublic?: boolean;
  organizationId: string;
  attendeeCount?: number;
  orderCount?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    attendees: number;
    ticketTypes?: number;
    orders?: number;
  };
  ticketTypes?: PublicTicketType[];
  organization?: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
}

export interface PublicTicketType {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  currency: string;
  quantity?: number | null;
  quantitySold: number;
  maxPerOrder: number;
  minPerOrder: number;
  isVisible: boolean;
}

export interface EventsResponse {
  items: Event[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface EventStats {
  totalAttendees: number;
  checkedIn: number;
  revenue: number;
  ticketsSold: number;
}

export interface CreateEventRequest {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  type?: Event['type'];
  startDate: string;
  endDate: string;
  timezone?: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  venueCountry?: string;
  currency?: string;
  maxAttendees?: number;
  isPublic?: boolean;
}

export interface EventQueryParams {
  page?: number;
  perPage?: number;
  status?: string;
  search?: string;
}

export const eventsApi = {
  getAll: (params?: EventQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.perPage) searchParams.set('perPage', params.perPage.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return api.get<EventsResponse>(`/events${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => api.get<Event>(`/events/${id}`),

  getPublicBySlug: (slug: string) => api.get<Event>(`/events/public/${slug}`, { skipAuth: true }),

  create: (data: CreateEventRequest) => api.post<Event>('/events', data),

  update: (id: string, data: Partial<CreateEventRequest>) => api.put<Event>(`/events/${id}`, data),

  delete: (id: string) => api.delete<void>(`/events/${id}`),

  publish: (id: string) => api.post<Event>(`/events/${id}/publish`),

  unpublish: (id: string) => api.post<Event>(`/events/${id}/unpublish`),

  cancel: (id: string) => api.post<Event>(`/events/${id}/cancel`),

  duplicate: (id: string) => api.post<Event>(`/events/${id}/duplicate`),

  getStats: (id: string) => api.get<EventStats>(`/events/${id}/stats`),
};
