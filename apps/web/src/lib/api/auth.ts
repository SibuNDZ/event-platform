import { api } from './client';
import type { CurrentUser, Organization } from '@/stores/auth-store';

export interface LoginRequest {
  email: string;
  password: string;
  organizationId?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
}

export interface AuthResponse {
  user: CurrentUser;
  organization: Organization | null;
  expiresIn?: number;
}

export interface RefreshResponse {
  expiresIn?: number;
}

export interface MeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data, { skipAuth: true }),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data, { skipAuth: true }),

  refresh: () =>
    api.post<RefreshResponse>('/auth/refresh', undefined, { skipAuth: true }),

  logout: () =>
    api.post<{ message: string }>('/auth/logout'),

  getMe: () =>
    api.get<MeResponse>('/auth/me'),

  getOrganizations: () =>
    api.get<Organization[]>('/auth/organizations'),
};
