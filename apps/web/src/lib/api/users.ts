import { api } from './client';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const usersApi = {
  updateMe: (data: UpdateProfileRequest) => api.put('/users/me', data),
};
