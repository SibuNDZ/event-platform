import { api } from './client';

export interface OrganizationMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER';
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface OrganizationDetails {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  licenseTier: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  logoUrl?: string;
  website?: string;
  description?: string;
}

export const organizationsApi = {
  getCurrent: () => api.get<OrganizationDetails>('/organization'),

  update: (data: UpdateOrganizationRequest) =>
    api.put<OrganizationDetails>('/organization', data),

  getMembers: () => api.get<OrganizationMember[]>('/organization/members'),
};
