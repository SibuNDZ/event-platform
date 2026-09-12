'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateEventRequest, EventQueryParams, eventsApi } from '@/lib/api/events';

export function useEvents(params?: EventQueryParams) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventsApi.getAll(params),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  });
}

export function usePublicEvent(slug: string) {
  return useQuery({
    queryKey: ['events', 'public', slug],
    queryFn: () => eventsApi.getPublicBySlug(slug),
    enabled: !!slug,
  });
}

export function useEventStats(id: string) {
  return useQuery({
    queryKey: ['events', id, 'stats'],
    queryFn: () => eventsApi.getStats(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventRequest> }) =>
      eventsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    },
  });
}

export function useUnpublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsApi.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    },
  });
}
