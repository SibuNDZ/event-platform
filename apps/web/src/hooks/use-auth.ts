'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore, AuthTokens } from '@/stores/auth-store';
import { authApi, LoginRequest, RegisterRequest, ApiTokens } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/client';

function convertTokens(apiTokens: ApiTokens): AuthTokens {
  return {
    accessToken: apiTokens.accessToken,
    refreshToken: apiTokens.refreshToken,
    expiresAt: Date.now() + apiTokens.expiresIn * 1000,
  };
}

export function useAuth() {
  const router = useRouter();
  const { user, organization, tokens, isAuthenticated, isHydrated, setAuth, clearAuth } =
    useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.organization, convertTokens(response.tokens));
      router.push('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      setAuth(response.user, response.organization, convertTokens(response.tokens));
      router.push('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (tokens?.refreshToken) {
        try {
          await authApi.logout(tokens.refreshToken);
        } catch {
          // Ignore logout errors - still clear local state
        }
      }
    },
    onSettled: () => {
      clearAuth();
      router.push('/login');
    },
  });

  return {
    user,
    organization,
    isAuthenticated,
    isHydrated,
    isLoading: loginMutation.isPending || registerMutation.isPending,

    login: loginMutation.mutateAsync,
    loginError: loginMutation.error as ApiClientError | null,
    isLoggingIn: loginMutation.isPending,
    resetLoginError: loginMutation.reset,

    register: registerMutation.mutateAsync,
    registerError: registerMutation.error as ApiClientError | null,
    isRegistering: registerMutation.isPending,
    resetRegisterError: registerMutation.reset,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
