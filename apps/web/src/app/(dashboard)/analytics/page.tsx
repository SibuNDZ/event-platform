'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatsCardSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton';
import { useEvents } from '@/hooks/use-events';

export default function AnalyticsPage() {
  const { data, isLoading, error } = useEvents({ limit: 100 });

  const totalEvents = data?.total || 0;
  const publishedEvents = data?.events?.filter((e) => e.status === 'PUBLISHED').length || 0;
  const totalAttendees = data?.events?.reduce((acc, e) => acc + (e._count?.attendees || 0), 0) || 0;

  const metrics = [
    { name: 'Total Events', value: totalEvents.toString(), change: 'All time' },
    { name: 'Published Events', value: publishedEvents.toString(), change: 'Currently live' },
    { name: 'Total Registrations', value: totalAttendees.toLocaleString(), change: 'Across all events' },
    {
      name: 'Avg. Registrations',
      value: totalEvents > 0 ? Math.round(totalAttendees / totalEvents).toString() : '0',
      change: 'Per event',
    },
  ];

  // Sort events by attendee count for top performers
  const topEvents = [...(data?.events || [])]
    .sort((a, b) => (b._count?.attendees || 0) - (a._count?.attendees || 0))
    .slice(0, 5);

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track performance and gain insights into your events.
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load analytics data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track performance and gain insights into your events.
        </p>
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
          {metrics.map((metric) => (
            <Card key={metric.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : !data?.events?.length ? (
          <Card className="lg:col-span-2">
            <EmptyState
              icon="chart"
              title="No analytics data yet"
              description="Create and publish events to start seeing analytics and insights."
              action={{
                label: 'Go to Events',
                onClick: () => (window.location.href = '/events'),
              }}
            />
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Events</CardTitle>
                <CardDescription>Events ranked by registration count.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No events with registrations yet.
                    </p>
                  ) : (
                    topEvents.map((event, index) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{event.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {(event._count?.attendees || 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">registrations</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Status Breakdown</CardTitle>
                <CardDescription>Distribution of events by status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      status: 'Published',
                      count: data.events.filter((e) => e.status === 'PUBLISHED').length,
                      color: 'bg-green-500',
                    },
                    {
                      status: 'Draft',
                      count: data.events.filter((e) => e.status === 'DRAFT').length,
                      color: 'bg-yellow-500',
                    },
                    {
                      status: 'Completed',
                      count: data.events.filter((e) => e.status === 'COMPLETED').length,
                      color: 'bg-blue-500',
                    },
                    {
                      status: 'Cancelled',
                      count: data.events.filter((e) => e.status === 'CANCELLED').length,
                      color: 'bg-red-500',
                    },
                  ].map((item) => {
                    const percentage =
                      totalEvents > 0 ? Math.round((item.count / totalEvents) * 100) : 0;
                    return (
                      <div key={item.status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.status}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
