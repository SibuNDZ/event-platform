import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Check,
  LayoutDashboard,
  Mail,
  QrCode,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingHeader } from '@/components/landing-header';

const highlights = [
  {
    title: 'Create and publish events',
    description: 'Set dates, venue, and ticket types, then publish a public registration page.',
    icon: CalendarDays,
  },
  {
    title: 'Registration that works',
    description:
      'Free tickets confirm immediately. Paid tickets use Stripe Checkout when configured.',
    icon: Users,
  },
  {
    title: 'QR check-in',
    description: 'Attendees get a ticket code. Staff paste it into the organizer check-in screen.',
    icon: QrCode,
  },
  {
    title: 'Organizer dashboard',
    description:
      'See events, attendees, and registration counts for the workspace you signed up with.',
    icon: LayoutDashboard,
  },
  {
    title: 'Team roles',
    description:
      'Owner, admin, staff, and viewer roles apply to event, attendee, and check-in actions.',
    icon: ShieldCheck,
  },
  {
    title: 'Optional Stripe and email',
    description:
      'Add STRIPE_SECRET_KEY for paid tickets and RESEND_API_KEY for confirmation emails.',
    icon: Mail,
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
    description: 'For teams running a focused event calendar.',
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
    description: 'For growing programs that need more capacity.',
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
    description: 'For organizations that need rollout help and future SSO.',
    features: [
      'Everything in Professional',
      'Unlimited events and attendees',
      'SSO and custom domains (planned)',
      'Webhook and API access',
      'Talk to us for rollout help',
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-faint opacity-70" />
          <div className="absolute -top-24 right-[5%] h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute bottom-[-120px] left-[-5%] h-[360px] w-[360px] rounded-full bg-accent/15 blur-3xl animate-float-slow" />

          <div className="container relative mx-auto px-4 py-20 lg:px-8 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.95fr] lg:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Create events, take registrations, and check people in
                </div>

                <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  A working event workspace for registration and door check-in.
                </h1>

                <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-balance">
                  Create an organization, publish an event, sell or give away tickets, and check
                  attendees in with a QR code. Stripe and email are optional extras.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/register">
                    <Button size="lg" className="gap-2 shadow-xl shadow-primary/20">
                      Start Free Trial <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button size="lg" variant="outline">
                      Request Demo
                    </Button>
                  </Link>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  No credit card required · Free tickets work without Stripe
                </p>
              </div>

              <div className="relative">
                <div className="glass-panel rounded-3xl p-6 shadow-2xl shadow-foreground/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">What you can do today</p>
                      <p className="text-xl font-semibold">Organizer workflow</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Preview
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
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
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="mt-1 text-lg font-semibold">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground">Path</p>
                    <p className="mt-0.5 text-sm font-semibold">
                      Sign up → create event → publish → register → check in
                    </p>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-teal-600" />
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card p-4 shadow-lg lg:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">
                      <Ticket className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Free tickets</p>
                      <p className="text-sm font-semibold">Confirm without Stripe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Built for modern teams
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                The core loop is live. Extra modules stay off the marketing page until they ship.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Sessions, CRM sync, SSO, badges, and campaign email are not part of this release.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
                  >
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-muted/40 py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                How it works
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                From workspace to door in three steps.
              </h2>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-border bg-background p-8"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="absolute top-12 -right-4 hidden h-px w-8 bg-border lg:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Pricing
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                Simple, transparent pricing.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Plan limits match the license tiers in the product. Paid checkout needs Stripe.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-3xl border bg-card p-8 ${
                    plan.popular
                      ? 'border-primary shadow-xl shadow-primary/10'
                      : 'border-border shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="mt-8 flex-1 space-y-3 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="h-3 w-3" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link
                      href={plan.slug === 'enterprise' ? '/demo' : `/register?plan=${plan.slug}`}
                    >
                      <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        {plan.slug === 'enterprise' ? 'Talk to Sales' : 'Get Started'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-24 lg:pb-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-16 text-center text-background lg:py-20">
              <div className="absolute inset-0 bg-grid-faint opacity-10" />
              <div className="relative mx-auto max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                  Ready to run your next registration?
                </h2>
                <p className="mt-4 text-background/80">
                  Create a workspace now, or send a demo request if you want a walkthrough.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-background text-foreground hover:bg-background/90"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
                    >
                      Talk to Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-card/30 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-700 text-primary-foreground">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Vibrant Events
                  </p>
                  <p className="text-base font-semibold tracking-tight">Operations Suite</p>
                </div>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Create events, take registrations, and check people in. Extra modules stay off this
                page until they ship.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Product
                </p>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <a
                      href="#features"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#pricing"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/demo"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Request a demo
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Account
                </p>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <Link
                      href="/login"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Create workspace
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Legal
                </p>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <Link
                      href="/privacy"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-border/60 pt-8">
            <p className="text-sm text-muted-foreground">
              © 2026 Vibrant Events. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
