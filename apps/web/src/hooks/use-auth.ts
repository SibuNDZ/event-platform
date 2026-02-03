'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { authApi, LoginRequest, RegisterRequest } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/client';

export function useAuth() {
  const router = useRouter();
  const { user, organization, isAuthenticated, isHydrated, setAuth, clearAuth } =
    useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.organization);
      router.push('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      setAuth(response.user, response.organization);
      router.push('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        // Ignore logout errors - still clear local state
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
