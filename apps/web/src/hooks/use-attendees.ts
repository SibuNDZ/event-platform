'use client';

import { useQuery } from '@tanstack/react-query';
import { attendeesApi, AttendeeQueryParams } from '@/lib/api/attendees';

export function useAttendees(eventId: string, params?: AttendeeQueryParams) {
  return useQuery({
    queryKey: ['attendees', eventId, params],
    queryFn: () => attendeesApi.getByEvent(eventId, params),
    enabled: !!eventId,
  });
}

export function useAttendee(eventId: string, id: string) {
  return useQuery({
    queryKey: ['attendees', eventId, id],
    queryFn: () => attendeesApi.getById(eventId, id),
    enabled: !!eventId && !!id,
  });
}
