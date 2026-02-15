import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary shadow-lg shadow-primary/20" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Vibrant Events
              </p>
              <p className="text-lg font-semibold">Operations Suite</p>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-3xl prose prose-neutral dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Vibrant Events platform, you agree to be bound by these Terms
            of Service. If you do not agree, please do not use our services.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Vibrant Events provides a cloud-based event management platform including registration,
            ticketing, check-in, communications, and analytics tools for event organizers and their
            attendees.
          </p>

          <h2>3. Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the security of your account credentials and for all
            activities under your account. You must provide accurate information during registration
            and keep it up to date.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the platform for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to other accounts or systems</li>
            <li>Transmit malware, spam, or other harmful content</li>
            <li>Interfere with the platform&apos;s operation or other users&apos; access</li>
            <li>Resell or redistribute the service without authorization</li>
          </ul>

          <h2>5. Payment Terms</h2>
          <p>
            Subscription fees are billed annually in South African Rands (ZAR). All fees are
            non-refundable unless otherwise stated. We reserve the right to modify pricing with 30
            days&apos; notice.
          </p>

          <h2>6. Data Ownership</h2>
          <p>
            You retain ownership of all data you upload to the platform. We do not claim
            intellectual property rights over your event content, attendee data, or organizational
            information.
          </p>

          <h2>7. Service Availability</h2>
          <p>
            We strive for high availability but do not guarantee uninterrupted service. Planned
            maintenance windows will be communicated in advance. Enterprise customers with SLA
            agreements have guaranteed uptime commitments.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            Vibrant Events shall not be liable for any indirect, incidental, or consequential
            damages arising from your use of the platform. Our total liability shall not exceed the
            amount paid by you in the preceding 12 months.
          </p>

          <h2>9. Termination</h2>
          <p>
            Either party may terminate the agreement at any time. Upon termination, you may request
            an export of your data within 30 days. After this period, your data will be permanently
            deleted.
          </p>

          <h2>10. Contact</h2>
          <p>
            For questions about these terms, contact us at{' '}
            <a href="mailto:legal@vibrant-events.co.za">legal@vibrant-events.co.za</a>.
          </p>
        </div>
      </main>

      <footer className="border-t py-12 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 Vibrant Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
