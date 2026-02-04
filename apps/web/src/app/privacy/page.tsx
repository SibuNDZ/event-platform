import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
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
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>

          <h2>1. Information We Collect</h2>
          <p>
            Vibrant Events collects information you provide directly, including your name,
            email address, organization details, and payment information when you register
            for an account or purchase tickets through our platform.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our event management services</li>
            <li>Process transactions and send related communications</li>
            <li>Send event updates, confirmations, and operational notifications</li>
            <li>Respond to your requests and provide customer support</li>
            <li>Monitor and analyze usage trends to improve user experience</li>
          </ul>

          <h2>3. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with event
            organizers for events you register for, payment processors to complete
            transactions, and service providers who assist in operating our platform.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures including encryption in
            transit and at rest, secure authentication, and regular security audits to
            protect your information.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. You may
            also request a copy of your data or object to its processing. Contact us at{' '}
            <a href="mailto:privacy@vibrant-events.co.za">privacy@vibrant-events.co.za</a>{' '}
            to exercise these rights.
          </p>

          <h2>6. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. Analytics
            cookies are only used with your consent to help us understand how our platform
            is used.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            For questions about this privacy policy, contact us at{' '}
            <a href="mailto:privacy@vibrant-events.co.za">privacy@vibrant-events.co.za</a>.
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
