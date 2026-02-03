import type { Metadata } from 'next';
import { Space_Grotesk, Fraunces } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const sans = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Vibrant Events - Modern Event Operations',
  description:
    'South Africa\'s modern event platform for registration, ticketing, check-in, and analytics at scale.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
