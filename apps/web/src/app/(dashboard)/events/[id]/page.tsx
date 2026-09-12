'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/loading-skeleton';
import { useEvent, usePublishEvent, useUnpublishEvent, useUpdateEvent } from '@/hooks/use-events';
import {
  useCreateTicketType,
  useDeleteTicketType,
  useTicketTypes,
  useUpdateTicketType,
} from '@/hooks/use-ticket-types';
import { toast } from '@/components/ui/use-toast';
import { ApiClientError } from '@/lib/api/client';
import { SUPPORTED_CURRENCIES } from '@/lib/currencies';

function money(value: string | number, currency = 'ZAR') {
  return `${currency} ${Number(value).toLocaleString()}`;
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;
  const { data: event, isLoading, error } = useEvent(eventId);
  const { data: ticketTypes } = useTicketTypes(eventId);
  const updateEvent = useUpdateEvent();
  const publishEvent = usePublishEvent();
  const unpublishEvent = useUnpublishEvent();
  const createTicketType = useCreateTicketType(eventId);
  const deleteTicketType = useDeleteTicketType(eventId);
  const updateTicketType = useUpdateTicketType(eventId);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    venueName: '',
    venueCity: '',
    currency: 'ZAR',
  });
  const [ticketForm, setTicketForm] = useState({
    name: 'General Admission',
    price: '0',
    quantity: '',
  });

  const startEdit = () => {
    if (!event) return;
    setForm({
      name: event.name,
      description: event.description || '',
      venueName: event.venueName || '',
      venueCity: event.venueCity || '',
      currency: event.currency || 'ZAR',
    });
    setEditing(true);
  };

  const saveEvent = async () => {
    try {
      await updateEvent.mutateAsync({
        id: eventId,
        data: {
          name: form.name,
          description: form.description || undefined,
          venueName: form.venueName || undefined,
          venueCity: form.venueCity || undefined,
          currency: form.currency,
        },
      });
      setEditing(false);
      toast({ title: 'Event updated' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: err instanceof ApiClientError ? err.message : 'Please try again.',
      });
    }
  };

  const togglePublish = async () => {
    try {
      if (event?.status === 'PUBLISHED') {
        await unpublishEvent.mutateAsync(eventId);
        toast({ title: 'Event unpublished' });
      } else {
        await publishEvent.mutateAsync(eventId);
        toast({ title: 'Event published', description: 'The public registration page is live.' });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not change status',
        description: err instanceof ApiClientError ? err.message : 'Please try again.',
      });
    }
  };

  const removeTicketType = async (id: string) => {
    try {
      await deleteTicketType.mutateAsync(id);
      toast({ title: 'Ticket type removed' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not remove ticket type',
        description: err instanceof ApiClientError ? err.message : 'Please try again.',
      });
    }
  };

  const toggleTicketVisibility = async (id: string, isVisible: boolean) => {
    try {
      await updateTicketType.mutateAsync({ id, data: { isVisible } });
      toast({ title: isVisible ? 'Ticket type shown' : 'Ticket type hidden' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not update ticket type',
        description: err instanceof ApiClientError ? err.message : 'Please try again.',
      });
    }
  };

  const addTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicketType.mutateAsync({
        name: ticketForm.name,
        price: Number(ticketForm.price) || 0,
        currency: event?.currency || 'ZAR',
        quantity: ticketForm.quantity ? Number(ticketForm.quantity) : undefined,
      });
      setTicketForm({ name: 'General Admission', price: '0', quantity: '' });
      toast({ title: 'Ticket type added' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not add ticket type',
        description: err instanceof ApiClientError ? err.message : 'Please try again.',
      });
    }
  };

  if (isLoading) {
    return <CardSkeleton />;
  }

  if (error || !event) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Event not found or you do not have access.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground">
            {format(new Date(event.startDate), 'MMM d, yyyy p')} · {event.venueName || event.type}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={editing ? saveEvent : startEdit}>
            {editing ? 'Save changes' : 'Edit'}
          </Button>
          <Button
            onClick={togglePublish}
            disabled={publishEvent.isPending || unpublishEvent.isPending}
          >
            {event.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          </Button>
          <Link href={`/events/${event.id}/check-in`}>
            <Button variant="outline">Check-in</Button>
          </Link>
          {event.status === 'PUBLISHED' && (
            <Link href={`/e/${event.slug}`} target="_blank">
              <Button variant="outline">Public page</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{event.status}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Attendees</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {event.attendeeCount ?? event._count?.attendees ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ticket types</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{ticketTypes?.length || 0}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Venue and copy shown on the public registration page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {editing ? (
            <>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border px-3 py-2"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full rounded-md border px-3 py-2"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={form.venueName}
                  onChange={(e) => setForm((prev) => ({ ...prev, venueName: e.target.value }))}
                  placeholder="Venue"
                  className="rounded-md border px-3 py-2"
                />
                <input
                  value={form.venueCity}
                  onChange={(e) => setForm((prev) => ({ ...prev, venueCity: e.target.value }))}
                  placeholder="City"
                  className="rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="event-currency" className="text-sm font-medium">
                  Currency
                </label>
                <select
                  id="event-currency"
                  value={form.currency}
                  onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Changing the currency updates every ticket type on this event.
                </p>
              </div>
            </>
          ) : (
            <>
              <p>{event.description || 'No description yet.'}</p>
              <p className="text-sm text-muted-foreground">
                {[event.venueName, event.venueCity, event.venueCountry]
                  .filter(Boolean)
                  .join(', ') || 'Venue not set'}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ticket types</CardTitle>
          <CardDescription>
            Free tickets complete immediately. Paid tickets use Stripe when configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]" onSubmit={addTicketType}>
            <input
              required
              value={ticketForm.name}
              onChange={(e) => setTicketForm((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-md border px-3 py-2"
              placeholder="Ticket name"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={ticketForm.price}
              onChange={(e) => setTicketForm((prev) => ({ ...prev, price: e.target.value }))}
              className="rounded-md border px-3 py-2"
              placeholder={`Price (${event?.currency || 'ZAR'})`}
            />
            <input
              type="number"
              min="1"
              value={ticketForm.quantity}
              onChange={(e) => setTicketForm((prev) => ({ ...prev, quantity: e.target.value }))}
              className="rounded-md border px-3 py-2"
              placeholder="Qty (optional)"
            />
            <Button type="submit" disabled={createTicketType.isPending}>
              Add
            </Button>
          </form>
          <div className="space-y-2">
            {(ticketTypes || []).map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{ticket.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {money(ticket.price, ticket.currency)} · sold {ticket.quantitySold}
                    {ticket.quantity != null ? ` / ${ticket.quantity}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!ticket.isVisible && (
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Hidden
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTicketVisibility(ticket.id, !ticket.isVisible)}
                    disabled={updateTicketType.isPending}
                  >
                    {ticket.isVisible ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTicketType(ticket.id)}
                    disabled={deleteTicketType.isPending}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {ticketTypes?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add at least one ticket type before sharing registration.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
