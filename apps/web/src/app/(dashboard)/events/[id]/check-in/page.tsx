'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEvent } from '@/hooks/use-events';
import { useCheckIn, useCheckInStats } from '@/hooks/use-check-in';
import { toast } from '@/components/ui/use-toast';
import { ApiClientError } from '@/lib/api/client';

export default function EventCheckInPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;
  const { data: event } = useEvent(eventId);
  const { data: stats } = useCheckInStats(eventId);
  const checkIn = useCheckIn(eventId);
  const [qrCode, setQrCode] = useState('');
  const [lastResult, setLastResult] = useState<string>('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await checkIn.mutateAsync(qrCode.trim());
      if (result.success && result.attendee) {
        const message = `Checked in ${result.attendee.firstName} ${result.attendee.lastName}`;
        setLastResult(message);
        toast({ title: 'Checked in', description: result.attendee.ticketType });
        setQrCode('');
      } else {
        setLastResult(result.message || 'Check-in failed');
        toast({
          variant: 'destructive',
          title: result.alreadyCheckedIn ? 'Already checked in' : 'Check-in failed',
          description: result.message,
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Check-in failed',
        description: err instanceof ApiClientError ? err.message : 'Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Check-in</h1>
          <p className="text-muted-foreground">{event?.name || 'Scan or paste a ticket QR code'}</p>
        </div>
        <Link href={`/events/${eventId}`}>
          <Button variant="outline">Back to event</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Attendees</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.totalAttendees ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Checked in</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.checkedIn ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats ? `${Math.round(stats.checkInRate)}%` : '0%'}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan ticket</CardTitle>
          <CardDescription>Paste the QR code value from the confirmation page.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
            <input
              autoFocus
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="QR-…"
              className="flex-1 rounded-md border px-3 py-2"
            />
            <Button type="submit" disabled={!qrCode.trim() || checkIn.isPending}>
              {checkIn.isPending ? 'Checking…' : 'Check in'}
            </Button>
          </form>
          {lastResult && <p className="mt-4 text-sm text-muted-foreground">{lastResult}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
