'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatsCardSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton';
import { useEvents } from '@/hooks/use-events';
import { format } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, error } = useEvents({ limit: 5 });

  const stats = [
    {
      name: 'Total Events',
      value: data?.total?.toString() || '0',
      change: 'All time',
    },
    {
      name: 'Published Events',
      value: data?.events?.filter((e) => e.status === 'PUBLISHED').length.toString() || '0',
      change: 'Currently live',
    },
    {
      name: 'Total Attendees',
      value: data?.events?.reduce((acc, e) => acc + (e._count?.attendees || 0), 0).toLocaleString() || '0',
      change: 'Across all events',
    },
    {
      name: 'Draft Events',
      value: data?.events?.filter((e) => e.status === 'DRAFT').length.toString() || '0',
      change: 'Ready to publish',
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your events.
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load dashboard data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your events.
        </p>
      </div>

      {/* Stats */}
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Events */}
      {isLoading ? (
        <CardSkeleton />
      ) : !data?.events || data.events.length === 0 ? (
        <Card>
          <EmptyState
            icon="calendar"
            title="No events yet"
            description="Create your first event to start managing registrations, tickets, and attendees."
            action={{
              label: 'Create Event',
              onClick: () => router.push('/events'),
            }}
          />
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Your latest events and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.startDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {event._count?.attendees || 0} attendees
                    </p>
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
