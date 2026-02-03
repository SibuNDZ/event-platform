import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  licenseTier?: string;
}

interface AuthState {
  user: CurrentUser | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  setAuth: (user: CurrentUser, organization: Organization | null) => void;
  setOrganization: (organization: Organization | null) => void;
  clearAuth: () => void;
  setHydrated: (hydrated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, organization) =>
        set({
          user,
          organization,
          isAuthenticated: true,
        }),

      setOrganization: (organization) =>
        set({
          organization,
        }),

      clearAuth: () =>
        set({
          user: null,
          organization: null,
          isAuthenticated: false,
        }),

      setHydrated: (hydrated) =>
        set({
          isHydrated: hydrated,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
