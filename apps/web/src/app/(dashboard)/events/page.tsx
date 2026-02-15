'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/loading-skeleton';
import { useEvents } from '@/hooks/use-events';
import { format } from 'date-fns';

export default function EventsPage() {
  const router = useRouter();
  const [page] = useState(1);
  const { data, isLoading, error } = useEvents({ page, limit: 12 });

  const handleCreateEvent = () => {
    // TODO: Open create event modal or navigate to create page
    console.log('Create event');
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage your events and track registrations.</p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load events. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage your events and track registrations.</p>
        </div>
        <Button onClick={handleCreateEvent}>Create Event</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !data?.events || data.events.length === 0 ? (
        <Card>
          <EmptyState
            icon="calendar"
            title="No events yet"
            description="Get started by creating your first event. You can set up registration, tickets, and more."
            action={{
              label: 'Create Event',
              onClick: handleCreateEvent,
            }}
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.events.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/events/${event.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      event.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : event.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <CardDescription>
                  {format(new Date(event.startDate), 'MMM d, yyyy')}
                  {event.endDate !== event.startDate &&
                    ` - ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {event.venue && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span>{event.venue}</span>
                    </div>
                  )}
                  {event.isVirtual && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span>Virtual Event</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attendees</span>
                    <span>{event._count?.attendees?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.total > data.limit && (
        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Showing {data.events.length} of {data.total} events
          </p>
        </div>
      )}
    </div>
  );
}
