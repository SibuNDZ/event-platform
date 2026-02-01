import { api } from './client';
import type { CurrentUser, Organization, AuthTokens } from '@/stores/auth-store';

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

export interface ApiTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: CurrentUser;
  organization: Organization | null;
  tokens: ApiTokens;
}

export interface RefreshResponse {
  tokens: ApiTokens;
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

  refresh: (refreshToken: string) =>
    api.post<RefreshResponse>('/auth/refresh', { refreshToken }, { skipAuth: true }),

  logout: (refreshToken: string) =>
    api.post<{ message: string }>('/auth/logout', { refreshToken }),

  getMe: () =>
    api.get<MeResponse>('/auth/me'),
};
