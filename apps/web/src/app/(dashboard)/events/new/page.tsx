'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCreateEvent } from '@/hooks/use-events';
import { toast } from '@/components/ui/use-toast';
import { ApiClientError } from '@/lib/api/client';
import { SUPPORTED_CURRENCIES } from '@/lib/currencies';

export default function CreateEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'IN_PERSON' as 'IN_PERSON' | 'VIRTUAL' | 'HYBRID',
    startDate: '',
    endDate: '',
    timezone: 'Africa/Johannesburg',
    venueName: '',
    venueCity: '',
    venueCountry: 'South Africa',
    currency: 'ZAR',
    maxAttendees: '',
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const event = await createEvent.mutateAsync({
        name: form.name,
        description: form.description || undefined,
        type: form.type,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        timezone: form.timezone,
        venueName: form.venueName || undefined,
        venueCity: form.venueCity || undefined,
        venueCountry: form.venueCountry || undefined,
        currency: form.currency,
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
      });
      toast({ title: 'Event created', description: 'Add ticket types, then publish when ready.' });
      router.push(`/events/${event.id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not create event',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
      });
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create event</h1>
        <p className="text-muted-foreground">Set the basics. You can add tickets after saving.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Event details</CardTitle>
          <CardDescription>These fields are required to publish later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                required
                name="name"
                value={form.name}
                onChange={onChange}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Start</label>
                <input
                  required
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End</label>
                <input
                  required
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="IN_PERSON">In person</option>
                  <option value="VIRTUAL">Virtual</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Venue</label>
                <input
                  name="venueName"
                  value={form.venueName}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <input
                  name="venueCity"
                  value={form.venueCity}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max attendees</label>
                <input
                  type="number"
                  min="1"
                  name="maxAttendees"
                  value={form.maxAttendees}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending ? 'Creating…' : 'Create event'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/events')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
