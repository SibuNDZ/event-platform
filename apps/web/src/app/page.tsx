import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg" />
            <span className="text-xl font-bold">EventPlatform</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Enterprise Event Management Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Create, manage, and scale your events with our comprehensive platform.
              From registration to check-in, we've got you covered.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Start Free Trial</Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything you need to run successful events
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Registration & Ticketing',
                  description:
                    'Custom forms, multiple ticket types, early-bird pricing, and discount codes.',
                },
                {
                  title: 'Check-in & Access Control',
                  description:
                    'QR code scanning, offline support, session-level access, real-time stats.',
                },
                {
                  title: 'Analytics & Reporting',
                  description:
                    'Real-time dashboards, attendance reports, CSV/XLS exports, API access.',
                },
                {
                  title: 'Virtual Events',
                  description:
                    'Live streaming, Q&A, polls, chat, networking, and on-demand content.',
                },
                {
                  title: 'Payment Processing',
                  description:
                    'Stripe, PayPal, and regional gateways. Invoicing and refunds included.',
                },
                {
                  title: 'Communications',
                  description:
                    'Email campaigns, WhatsApp tickets, reminders, and personalized messaging.',
                },
              ].map((feature, i) => (
                <div key={i} className="bg-card rounded-lg p-6 border">
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Choose the plan that fits your organization
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: 'Standard',
                  price: 'R275,000',
                  period: '/year',
                  slug: 'standard',
                  features: [
                    'Unlimited internal events',
                    'Up to 1,000 attendees/event',
                    'Registration & check-in',
                    'Basic analytics',
                    'Email support',
                  ],
                },
                {
                  name: 'Professional',
                  price: 'R735,000',
                  period: '/year',
                  slug: 'professional',
                  popular: true,
                  features: [
                    'Everything in Standard',
                    'Up to 5,000 attendees/event',
                    'Virtual events',
                    'Advanced analytics',
                    'Custom branding',
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
                    'Unlimited attendees',
                    'SSO integration',
                    'Dedicated support',
                    'Custom development',
                    'SLA guarantee',
                  ],
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-8 border ${
                    plan.popular ? 'border-primary shadow-lg' : ''
                  }`}
                >
                  {plan.popular && (
                    <span className="text-sm font-medium text-primary">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-2xl font-bold mt-2">{plan.name}</h3>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center">
                        <svg
                          className="w-5 h-5 text-primary mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.slug === 'enterprise' ? '/demo' : `/register?plan=${plan.slug}`}>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Event Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
