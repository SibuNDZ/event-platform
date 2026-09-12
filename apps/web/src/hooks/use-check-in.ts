'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkInApi } from '@/lib/api/check-in';

export function useCheckInStats(eventId: string) {
  return useQuery({
    queryKey: ['check-in-stats', eventId],
    queryFn: () => checkInApi.stats(eventId),
    enabled: !!eventId,
  });
}

export function useCheckIn(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qrCode: string) => checkInApi.checkIn(qrCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-in-stats', eventId] });
      queryClient.invalidateQueries({ queryKey: ['attendees', eventId] });
    },
  });
}
