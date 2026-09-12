import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const highlights = [
    {
      title: 'Create and publish events',
      description: 'Set dates, venue, and ticket types, then publish a public registration page.',
    },
    {
      title: 'Registration that works',
      description: 'Free tickets confirm immediately. Paid tickets use Stripe Checkout when configured.',
    },
    {
      title: 'QR check-in',
      description: 'Attendees get a ticket code. Staff paste it into the organizer check-in screen.',
    },
    {
      title: 'Organizer dashboard',
      description: 'See events, attendees, and registration counts for the workspace you signed up with.',
    },
    {
      title: 'Team roles',
      description: 'Owner, admin, staff, and viewer roles apply to event, attendee, and check-in actions.',
    },
    {
      title: 'Optional Stripe and email',
      description: 'Add STRIPE_SECRET_KEY for paid tickets and RESEND_API_KEY for confirmation emails.',
    },
  ];

  const steps = [
    {
      title: 'Create a workspace',
      description: 'Register an organization, then create your first event from the dashboard.',
    },
    {
      title: 'Add tickets and publish',
      description: 'Create a free or paid ticket type and publish the public /e/[slug] page.',
    },
    {
      title: 'Register and check in',
      description: 'Attendees register online. Staff check them in with the ticket QR code.',
    },
  ];

  const plans = [
    {
      name: 'Standard',
      price: 'R75,000',
      period: '/year',
      slug: 'standard',
      features: [
        'Up to 10 events',
        'Up to 1,000 attendees/event',
        'Registration and QR check-in',
        'Event attendee lists',
        'Email support',
      ],
    },
    {
      name: 'Professional',
      price: 'R195,000',
      period: '/year',
      slug: 'professional',
      popular: true,
      features: [
        'Up to 50 events',
        'Up to 5,000 attendees/event',
        'Virtual and hybrid event types',
        'Registration analytics',
        'Priority support',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      slug: 'enterprise',
      features: [
        'Everything in Professional',
        'Unlimited events and attendees',
        'SSO and custom domains (planned)',
        'Webhook and API access',
        'Talk to us for rollout help',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary shadow-lg shadow-primary/20" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Vibrant Events
              </p>
              <p className="text-lg font-semibold">Operations Suite</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="shadow-lg shadow-primary/25">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl animate-float" />
          <div className="absolute bottom-[-160px] left-[-5%] h-[360px] w-[360px] rounded-full bg-accent/20 blur-3xl animate-float-slow" />
          <div className="container mx-auto px-4 py-20 relative">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground">
                  <span className="inline-flex h-2 w-2 rounded-full bg-accent animate-shimmer" />
                  Create events, take registrations, and check people in
                </div>
                <h1 className="mt-6 text-5xl lg:text-6xl font-semibold text-balance">
                  A working event workspace for registration and door check-in.
                </h1>
                <p className="mt-6 text-lg text-muted-foreground text-balance">
                  Create an organization, publish an event, sell or give away tickets, and
                  check attendees in with a QR code. Stripe and email are optional extras.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/register">
                    <Button size="lg" className="shadow-xl shadow-primary/25">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button size="lg" variant="outline">
                      Request Demo
                    </Button>
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    No credit card required · Free tickets work without Stripe
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-6 shadow-2xl shadow-black/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">What you can do today</p>
                    <p className="text-2xl font-semibold">Organizer workflow</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Preview
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Create event', value: 'Ready' },
                    { label: 'Ticket types', value: 'Ready' },
                    { label: 'Public register', value: 'Ready' },
                    { label: 'QR check-in', value: 'Ready' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-border bg-background px-4 py-3"
                    >
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-semibold">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-foreground/5 p-4">
                  <p className="text-sm text-muted-foreground">Path</p>
                  <p className="text-base font-semibold">
                    Sign up → create event → publish → register → check in
                  </p>
                  <div className="mt-3 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-full rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center">
              <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                Built for modern teams
              </span>
              <h2 className="mt-4 text-4xl font-semibold text-balance">
                The core loop is live. Extra modules stay off the marketing page until they ship.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl">
                Sessions, CRM sync, SSO, badges, and campaign email are not part of this release.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {highlights.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                      <path
                        d="M5 12h14M12 5l7 7-7 7"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/40">
          <div className="container mx-auto grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border bg-background p-6">
                <p className="text-sm text-muted-foreground">Step {index + 1}</p>
                <h3 className="mt-3 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center">
              <h2 className="text-4xl font-semibold">Simple, transparent pricing</h2>
              <p className="mt-4 text-muted-foreground">
                Plan limits match the license tiers in the product. Paid checkout needs Stripe.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-3xl p-8 border ${
                    plan.popular ? 'border-primary shadow-xl shadow-primary/20' : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      Most Popular
                    </span>
                  )}
                  <h3 className="mt-3 text-2xl font-semibold">{plan.name}</h3>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.slug === 'enterprise' ? '/demo' : `/register?plan=${plan.slug}`}>
                    <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                      Get Started
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="rounded-3xl border border-border bg-foreground/5 p-10 text-center">
              <h2 className="text-3xl font-semibold text-balance">
                Ready to run your next registration?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Create a workspace now, or send a demo request if you want a walkthrough.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link href="/register">
                  <Button size="lg">Start Free Trial</Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 Vibrant Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
