'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { TableRowSkeleton } from '@/components/ui/loading-skeleton';
import { useEvents } from '@/hooks/use-events';
import { useAttendees } from '@/hooks/use-attendees';
import { format } from 'date-fns';

export default function AttendeesPage() {
  const { data: eventsData, isLoading: eventsLoading } = useEvents({ limit: 100 });
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const { data: attendeesData, isLoading: attendeesLoading } = useAttendees(selectedEventId, {
    limit: 50,
  });

  const isLoading = eventsLoading || (selectedEventId && attendeesLoading);

  // Auto-select first event if available
  if (!selectedEventId && eventsData?.events?.[0]?.id) {
    setSelectedEventId(eventsData.events[0].id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendees</h1>
          <p className="text-muted-foreground">View and manage all registered attendees.</p>
        </div>
        <Button disabled={!attendeesData?.attendees?.length}>Export List</Button>
      </div>

      {/* Event Selector */}
      {eventsData?.events && eventsData.events.length > 0 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Select Event:</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {eventsData.events.map((event) => (
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
              ? `Attendees for the selected event`
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
          ) : !eventsData?.events?.length ? (
            <EmptyState
              icon="calendar"
              title="No events yet"
              description="Create an event first to start registering attendees."
              action={{
                label: 'Go to Events',
                onClick: () => (window.location.href = '/events'),
              }}
            />
          ) : !attendeesData?.attendees?.length ? (
            <EmptyState
              icon="users"
              title="No attendees yet"
              description="Share your event registration page to start collecting attendees."
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
                  {attendeesData.attendees.map((attendee) => (
                    <tr key={attendee.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">
                        {attendee.firstName} {attendee.lastName}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{attendee.email}</td>
                      <td className="py-3 px-4">{attendee.ticketType?.name || 'General'}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {format(new Date(attendee.registeredAt), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            attendee.status === 'CHECKED_IN'
                              ? 'bg-green-100 text-green-700'
                              : attendee.status === 'CONFIRMED'
                                ? 'bg-blue-100 text-blue-700'
                                : attendee.status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {attendee.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
