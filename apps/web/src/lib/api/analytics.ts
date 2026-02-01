import { api } from './client';

export interface DashboardStats {
  totalEvents: number;
  totalAttendees: number;
  totalRevenue: number;
  checkInRate: number;
  recentEvents: {
    id: string;
    name: string;
    startDate: string;
    attendeeCount: number;
    status: string;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  attendeesByEvent: {
    eventName: string;
    count: number;
  }[];
}

export interface EventAnalytics {
  totalRegistrations: number;
  totalCheckedIn: number;
  totalRevenue: number;
  registrationsByDay: {
    date: string;
    count: number;
  }[];
  ticketBreakdown: {
    ticketType: string;
    sold: number;
    revenue: number;
  }[];
}

export const analyticsApi = {
  getEventDashboard: (eventId: string) =>
    api.get<EventAnalytics>(`/analytics/events/${eventId}/dashboard`),

  getDashboardStats: () => api.get<DashboardStats>('/analytics/dashboard'),
};
