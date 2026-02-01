'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsApi.getDashboardStats(),
  });
}

export function useEventAnalytics(eventId: string) {
  return useQuery({
    queryKey: ['analytics', eventId],
    queryFn: () => analyticsApi.getEventDashboard(eventId),
    enabled: !!eventId,
  });
}
