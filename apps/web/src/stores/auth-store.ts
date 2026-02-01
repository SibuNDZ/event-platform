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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthState {
  user: CurrentUser | null;
  organization: Organization | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  setAuth: (user: CurrentUser, organization: Organization | null, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
  setHydrated: (hydrated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      tokens: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, organization, tokens) =>
        set({
          user,
          organization,
          tokens,
          isAuthenticated: true,
        }),

      setTokens: (tokens) =>
        set({
          tokens,
        }),

      clearAuth: () =>
        set({
          user: null,
          organization: null,
          tokens: null,
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
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
