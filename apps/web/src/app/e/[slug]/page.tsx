'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePublicEvent } from '@/hooks/use-events';
import { registrationApi } from '@/lib/api/registration';
import { ApiClientError } from '@/lib/api/client';

function PublicEventPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const { data: event, isLoading, error } = usePublicEvent(params.slug);
  const [ticketTypeId, setTicketTypeId] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const selected =
    event?.ticketTypes?.find((ticket) => ticket.id === ticketTypeId) || event?.ticketTypes?.[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !selected) return;
    setSubmitting(true);
    setFormError('');
    try {
      const result = await registrationApi.register(event.id, {
        ticketTypeId: selected.id,
        attendees: [
          {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone || undefined,
            company: form.company || undefined,
          },
        ],
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      window.location.href = `/e/${event.slug}/confirmed?orderId=${result.orderId}`;
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold">
            Vibrant Events
          </Link>
          <Link href="/login">
            <Button variant="ghost">Organizer login</Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl space-y-6 px-4 py-10">
        {isLoading && <p className="text-muted-foreground">Loading event…</p>}
        {error && <p className="text-destructive">This event is not available.</p>}
        {event && (
          <>
            {searchParams.get('canceled') && (
              <Card className="border-destructive">
                <CardContent className="pt-6 text-sm text-destructive">
                  Payment was canceled. You can try again below.
                </CardContent>
              </Card>
            )}
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {event.organization?.name || 'Event'}
              </p>
              <h1 className="mt-2 text-4xl font-semibold">{event.name}</h1>
              <p className="mt-3 text-muted-foreground">
                {format(new Date(event.startDate), 'EEEE, MMM d, yyyy p')}
                {event.venueName ? ` · ${event.venueName}` : ''}
                {event.venueCity ? `, ${event.venueCity}` : ''}
              </p>
            </div>
            {event.description && <p className="text-lg leading-relaxed">{event.description}</p>}
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                  Free tickets confirm immediately. Paid tickets continue to Stripe checkout.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={submit}>
                  <div className="space-y-2">
                    {(event.ticketTypes || []).map((ticket) => (
                      <label
                        key={ticket.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
                          (ticketTypeId || selected?.id) === ticket.id ? 'border-primary' : ''
                        }`}
                      >
                        <span>
                          <input
                            type="radio"
                            className="mr-3"
                            checked={(ticketTypeId || selected?.id) === ticket.id}
                            onChange={() => setTicketTypeId(ticket.id)}
                          />
                          {ticket.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {ticket.currency} {Number(ticket.price).toLocaleString()}
                        </span>
                      </label>
                    ))}
                    {!event.ticketTypes?.length && (
                      <p className="text-sm text-muted-foreground">Registration is not open yet.</p>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      required
                      placeholder="First name"
                      value={form.firstName}
                      onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      className="rounded-md border px-3 py-2"
                    />
                    <input
                      required
                      placeholder="Last name"
                      value={form.lastName}
                      onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="rounded-md border px-3 py-2"
                    />
                  </div>
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      placeholder="Phone"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="rounded-md border px-3 py-2"
                    />
                    <input
                      placeholder="Company"
                      value={form.company}
                      onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                      className="rounded-md border px-3 py-2"
                    />
                  </div>
                  {formError && <p className="text-sm text-destructive">{formError}</p>}
                  <Button type="submit" disabled={submitting || !selected}>
                    {submitting
                      ? 'Submitting…'
                      : selected && Number(selected.price) > 0
                        ? 'Continue to payment'
                        : 'Confirm registration'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

export default function PublicEventPageRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading event…</div>}>
      <PublicEventPage />
    </Suspense>
  );
}
