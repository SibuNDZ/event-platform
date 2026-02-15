'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatsCardSkeleton, TableRowSkeleton } from '@/components/ui/loading-skeleton';
import { useEvents } from '@/hooks/use-events';

export default function OrdersPage() {
  const { data, isLoading, error } = useEvents({ limit: 100 });

  // Calculate stats from events data
  const totalAttendees = data?.events?.reduce((acc, e) => acc + (e._count?.attendees || 0), 0) || 0;

  const stats = [
    { name: 'Total Registrations', value: totalAttendees.toLocaleString() },
    {
      name: 'Events with Sales',
      value: data?.events?.filter((e) => (e._count?.attendees || 0) > 0).length.toString() || '0',
    },
    {
      name: 'Published Events',
      value: data?.events?.filter((e) => e.status === 'PUBLISHED').length.toString() || '0',
    },
    { name: 'Total Events', value: data?.total?.toString() || '0' },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Track ticket sales and manage orders.</p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load orders data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Track ticket sales and manage orders.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registration Summary by Event</CardTitle>
          <CardDescription>Overview of registrations across all events.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Event</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Registrations</th>
                    <th className="text-left py-3 px-4 font-medium">Ticket Types</th>
                  </tr>
                </thead>
                <tbody>
                  <TableRowSkeleton columns={4} />
                  <TableRowSkeleton columns={4} />
                  <TableRowSkeleton columns={4} />
                </tbody>
              </table>
            </div>
          ) : !data?.events?.length ? (
            <EmptyState
              icon="receipt"
              title="No orders yet"
              description="Orders will appear here once attendees register for your events."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Event</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Registrations</th>
                    <th className="text-left py-3 px-4 font-medium">Ticket Types</th>
                  </tr>
                </thead>
                <tbody>
                  {data.events.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{event.name}</td>
                      <td className="py-3 px-4">
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
                      </td>
                      <td className="py-3 px-4">{event._count?.attendees || 0}</td>
                      <td className="py-3 px-4">{event._count?.ticketTypes || 0}</td>
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
