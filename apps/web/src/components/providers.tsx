'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore, AuthTokens } from '@/stores/auth-store';
import { authApi, ApiTokens } from '@/lib/api/auth';

function convertTokens(apiTokens: ApiTokens): AuthTokens {
  return {
    accessToken: apiTokens.accessToken,
    refreshToken: apiTokens.refreshToken,
    expiresAt: Date.now() + apiTokens.expiresIn * 1000,
  };
}

function AuthRefreshTimer() {
  const { tokens, setTokens, clearAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !tokens) return;

    const checkAndRefresh = async () => {
      const now = Date.now();
      const expiresAt = tokens.expiresAt;
      const bufferMs = 60 * 1000; // Refresh 1 minute before expiry

      if (expiresAt - now < bufferMs) {
        try {
          const response = await authApi.refresh(tokens.refreshToken);
          setTokens(convertTokens(response.tokens));
        } catch {
          clearAuth();
        }
      }
    };

    // Check immediately on mount
    checkAndRefresh();

    // Then check every 30 seconds
    const interval = setInterval(checkAndRefresh, 30 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, tokens, setTokens, clearAuth]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthRefreshTimer />
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
