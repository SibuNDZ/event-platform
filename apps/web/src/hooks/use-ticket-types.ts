'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateTicketTypeRequest, ticketTypesApi } from '@/lib/api/ticket-types';

export function useTicketTypes(eventId: string) {
  return useQuery({
    queryKey: ['ticket-types', eventId],
    queryFn: () => ticketTypesApi.list(eventId),
    enabled: !!eventId,
  });
}

export function useCreateTicketType(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketTypeRequest) => ticketTypesApi.create(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
    },
  });
}

export function useDeleteTicketType(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketTypesApi.delete(eventId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
    },
  });
}
