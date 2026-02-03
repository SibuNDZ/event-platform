'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api/auth';

function AuthRefreshTimer() {
  const { clearAuth, isAuthenticated } = useAuthStore();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshToken = async () => {
      try {
        await authApi.refresh();
      } catch {
        clearAuth();
      }
    };

    // Refresh every 12 minutes (tokens expire in 15m by default)
    intervalRef.current = setInterval(refreshToken, 12 * 60 * 1000);

    return () => clearInterval(intervalRef.current);
  }, [isAuthenticated, clearAuth]);

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
