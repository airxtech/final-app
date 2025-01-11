import type { Metadata } from 'next';
import '@twa-dev/sdk';
import Layout from './components/Layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Telegram Mini App',
  description: 'Your app description here',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}