'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsApi, UpdateOrganizationRequest } from '@/lib/api/organizations';

export function useOrganization() {
  return useQuery({
    queryKey: ['organization'],
    queryFn: () => organizationsApi.getCurrent(),
  });
}

export function useOrganizationMembers() {
  return useQuery({
    queryKey: ['organization', 'members'],
    queryFn: () => organizationsApi.getMembers(),
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationRequest) => organizationsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });
}
