'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { TableRowSkeleton } from '@/components/ui/loading-skeleton';
import { useEvents } from '@/hooks/use-events';
import { useAttendees } from '@/hooks/use-attendees';
import { getAttendeeStatus } from '@/lib/api/attendees';
import { format } from 'date-fns';

export default function AttendeesPage() {
  const { data: eventsData, isLoading: eventsLoading } = useEvents({ perPage: 100 });
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const events = eventsData?.items || [];

  const { data: attendeesData, isLoading: attendeesLoading } = useAttendees(selectedEventId, {
    perPage: 50,
  });
  const attendees = attendeesData?.items || [];

  const isLoading = eventsLoading || (selectedEventId && attendeesLoading);

  useEffect(() => {
    if (!selectedEventId && events[0]?.id) {
      setSelectedEventId(events[0].id);
    }
  }, [selectedEventId, events]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendees</h1>
        <p className="text-muted-foreground">People who registered for your published events.</p>
      </div>

      {events.length > 0 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Select Event:</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Attendees</CardTitle>
          <CardDescription>
            {selectedEventId
              ? 'Attendees for the selected event'
              : 'Select an event to view attendees'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Ticket</th>
                    <th className="text-left py-3 px-4 font-medium">Registered</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                </tbody>
              </table>
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No events yet"
              description="Create an event first to start registering attendees."
              action={{
                label: 'Go to Events',
                onClick: () => (window.location.href = '/events/new'),
              }}
            />
          ) : attendees.length === 0 ? (
            <EmptyState
              icon="users"
              title="No attendees yet"
              description="Publish the event and share the public registration page."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Ticket</th>
                    <th className="text-left py-3 px-4 font-medium">Registered</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => {
                    const status = getAttendeeStatus(attendee);
                    return (
                      <tr key={attendee.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">
                          {attendee.firstName} {attendee.lastName}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{attendee.email}</td>
                        <td className="py-3 px-4">
                          {attendee.tickets?.[0]?.ticketType?.name ||
                            attendee.tickets?.[0]?.ticketNumber ||
                            'General'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {format(new Date(attendee.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              status === 'CHECKED_IN'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
