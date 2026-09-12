'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { registrationApi, type RegistrationResult } from '@/lib/api/registration';

function RegistrationConfirmedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const sessionId = searchParams.get('session_id') || '';
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (sessionId) {
          setResult(await registrationApi.getCheckoutStatus(sessionId));
          return;
        }
        if (orderId) {
          setResult(await registrationApi.getOrder(orderId));
        }
      } catch {
        setError('We could not load this registration.');
      }
    }
    void load();
  }, [orderId, sessionId]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 font-semibold">Vibrant Events</div>
      </header>
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              {result?.status === 'completed' ? 'You are registered' : 'Registration status'}
            </CardTitle>
            <CardDescription>
              {result?.event?.name || 'Keep this ticket code for check-in.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-destructive">{error}</p>}
            {!result && !error && <p className="text-muted-foreground">Loading confirmation…</p>}
            {result && (
              <>
                <p className="text-sm text-muted-foreground">Order {result.orderNumber}</p>
                <div className="space-y-3">
                  {(result.tickets || []).map((ticket) => (
                    <div key={ticket.id} className="rounded-lg border p-4">
                      <p className="font-medium">{ticket.ticketNumber}</p>
                      <p className="mt-2 break-all font-mono text-sm">{ticket.qrCode}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Show this code at the door. Staff can paste it into check-in.
                      </p>
                    </div>
                  ))}
                </div>
                {result.status !== 'completed' && (
                  <p className="text-sm text-muted-foreground">
                    Payment is still processing. Refresh this page in a moment.
                  </p>
                )}
              </>
            )}
            <Link href="/">
              <Button variant="outline">Back home</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function RegistrationConfirmedPageRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading confirmation…</div>}>
      <RegistrationConfirmedPage />
    </Suspense>
  );
}
